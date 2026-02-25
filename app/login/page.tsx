import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login | PixelGuess",
};

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold font-mono mb-8">Sign in to PixelGuess</h1>
      <LoginForm />
    </main>
  );
}
