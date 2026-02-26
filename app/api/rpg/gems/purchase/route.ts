import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const GEM_PACKAGES = [
  { gems: 100, priceInCents: 99, name: "100 Gems" },
  { gems: 500, priceInCents: 399, name: "500 Gems" },
  { gems: 1200, priceInCents: 799, name: "1200 Gems" },
];

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { packageIndex } = body;

  const pkg = GEM_PACKAGES[packageIndex];
  if (!pkg) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: pkg.name },
          unit_amount: pkg.priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      gems: String(pkg.gems),
      type: "gem_purchase",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/rpg/shop?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/rpg/shop?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
