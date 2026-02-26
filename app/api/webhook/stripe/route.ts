import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.type === "gem_purchase") {
      const userId = session.metadata.user_id;
      const gems = parseInt(session.metadata.gems, 10);

      await getSupabaseAdmin().rpc("increment_gems", {
        p_user_id: userId,
        p_gems: gems,
      });
    } else {
      const userId = session.client_reference_id!;
      const subscriptionId = session.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data"],
      });

      const periodEnd = subscription.items.data[0]?.current_period_end ?? 0;

      await getSupabaseAdmin().from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        status: subscription.status,
        current_period_end: new Date(periodEnd * 1000).toISOString(),
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const periodEnd = subscription.items?.data[0]?.current_period_end ?? 0;

    await getSupabaseAdmin()
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_end: new Date(periodEnd * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
