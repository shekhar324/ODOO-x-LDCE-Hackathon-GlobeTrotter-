"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { IconArrowRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { useAuth } from "@/context/auth-context";

// ─── Schemas ────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

// ─── Input Component ─────────────────────────────────────────────────────────

function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  error,
  rightSlot,
  ...props
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  rightSlot?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="font-sans text-sm text-[#020202]" htmlFor={id}>
          {label}
        </label>
        {rightSlot}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-4 bg-transparent border border-[#020202] font-sans text-sm text-[#020202] placeholder:text-[#889486] focus:outline-none focus:ring-1 focus:ring-[#020202] transition-shadow"
        {...props}
      />
      {error && (
        <p className="text-[#93000a] text-xs font-sans">{error}</p>
      )}
    </div>
  );
}

// ─── Sign In Panel ────────────────────────────────────────────────────────────

function SignInPanel({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInForm) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    toast.success("Welcome back");
    const next = searchParams.get("next") ?? "/dashboard";
    router.push(next);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <FormInput
        id="signin-email"
        label="Email"
        type="email"
        placeholder="nomad@example.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <FormInput
        id="signin-password"
        label="Password"
        type={showPw ? "text" : "password"}
        placeholder="••••••••"
        error={form.formState.errors.password?.message}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="text-[#020202] hover:opacity-60 transition-opacity"
          >
            {showPw ? (
              <IconEyeOff className="w-4 h-4" />
            ) : (
              <IconEye className="w-4 h-4" />
            )}
          </button>
        }
        {...form.register("password")}
      />

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full mt-2 py-4 bg-[#2d9b4c] text-white font-sans text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {form.formState.isSubmitting ? "Signing in…" : "Sign In"}
        <IconArrowRight className="w-5 h-5" />
      </button>

      <div className="mt-6 pt-6 border-t border-[#efefe7] text-center">
        <p className="font-sans text-sm text-[#020202]">
          No account yet?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Create one
          </button>
        </p>
      </div>
    </form>
  );
}

// ─── Sign Up Panel ────────────────────────────────────────────────────────────

function SignUpPanel({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignUpForm) => {
    const { error } = await signUp(data.email, data.password, data.fullName);
    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }
    toast.success("Account created!", {
      description: "Check your email to confirm your address, then sign in.",
    });
    // After sign-up, Supabase sends a confirmation email.
    // Switch to sign-in tab so the user can proceed.
    onSwitch();
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <FormInput
        id="signup-name"
        label="Full Name"
        placeholder="Your name"
        error={form.formState.errors.fullName?.message}
        {...form.register("fullName")}
      />

      <FormInput
        id="signup-email"
        label="Email"
        type="email"
        placeholder="nomad@example.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <FormInput
        id="signup-password"
        label="Password"
        type={showPw ? "text" : "password"}
        placeholder="Min. 8 characters"
        error={form.formState.errors.password?.message}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="text-[#020202] hover:opacity-60 transition-opacity"
          >
            {showPw ? (
              <IconEyeOff className="w-4 h-4" />
            ) : (
              <IconEye className="w-4 h-4" />
            )}
          </button>
        }
        {...form.register("password")}
      />

      <FormInput
        id="signup-confirm"
        label="Confirm Password"
        type={showPw ? "text" : "password"}
        placeholder="Repeat password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full mt-2 py-4 bg-[#2d9b4c] text-white font-sans text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {form.formState.isSubmitting ? "Creating account…" : "Create Account"}
        <IconArrowRight className="w-5 h-5" />
      </button>

      <div className="mt-4 pt-6 border-t border-[#efefe7] text-center">
        <p className="font-sans text-sm text-[#020202]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "signin"
  );

  // Sync tab with URL param if it changes (e.g. from AuthGuard "Create Account" link)
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "signup") setTab("signup");
    else if (t === "signin") setTab("signin");
  }, [searchParams]);

  const headings = {
    signin: { title: "Welcome Back", sub: "Access your curated itineraries and travel concierge." },
    signup: { title: "Join GlobeTrotter", sub: "Create your account and start planning your next journey." },
  };

  return (
    <div className="bg-[#0e0e0e] text-[#e2e2e2] antialiased min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' fill='%23fff'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-[1200px] z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-[#c3eeb4] text-[#002200] rounded-full mt-6">
        <div className="font-serif text-2xl tracking-tighter font-light">
          GlobeTrotter
        </div>
        <Link
          href="/"
          className="font-sans text-sm px-6 py-3 bg-[#020202] text-white rounded-full hover:opacity-80 transition-opacity"
        >
          Return Home
        </Link>
      </nav>

      <main className="w-full max-w-[1200px] px-6 md:px-12 z-10 flex flex-col items-center pt-[140px] pb-32">
        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-12 max-w-2xl"
          >
            <EditorialHeading className="text-[56px] md:text-[80px] tracking-tight leading-none text-white mb-4 font-thin">
              {headings[tab].title}
            </EditorialHeading>
            <p className="font-sans text-lg text-[#becabb]">
              {headings[tab].sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Tab Switcher */}
        <div className="flex border border-white/20 mb-10">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-10 py-3 font-sans text-sm transition-colors cursor-pointer ${
                tab === t
                  ? "bg-[#c3eeb4] text-[#002200]"
                  : "text-[#becabb] hover:text-white"
              }`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="w-full max-w-[480px] bg-white shadow-2xl shadow-black/50 p-10 relative z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "signin" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "signin" ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "signin" ? (
                <SignInPanel onSwitch={() => setTab("signup")} />
              ) : (
                <SignUpPanel onSwitch={() => setTab("signin")} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
