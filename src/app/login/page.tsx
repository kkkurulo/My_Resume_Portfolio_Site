import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimatedBackground } from "@/components/site/animated-background";
import { isLoggedIn } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <AnimatedBackground />
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-ink">Admin login</h1>
        <p className="mt-2 mb-8 text-sm text-muted">Sign in to edit your site.</p>
        <LoginForm />
        <Link href="/" className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
