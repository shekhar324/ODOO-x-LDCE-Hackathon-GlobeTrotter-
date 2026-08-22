"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { IconArrowRight, IconEye, IconEyeOff, IconLock, IconMail, IconUser, IconPhone, IconMapPin, IconSparkles } from "@tabler/icons-react";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { useAuth } from "@/context/auth-context";

// ─── Schemas ────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(5, "Phone number is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    additionalInfo: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

// ─── Glass Input Component ───────────────────────────────────────────────────

function GlassInput({
  id,
  label,
  type = "text",
  placeholder,
  error,
  icon: Icon,
  rightSlot,
  ...props
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: React.ElementType;
  rightSlot?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <label className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-300 flex items-center gap-1.5" htmlFor={id}>
          {Icon && <Icon className="w-3.5 h-3.5 text-[#72dc85]" />}
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl font-sans text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all backdrop-blur-md"
          {...props}
        />
      </div>
      {error && (
        <p className="text-[#ff6b6b] text-xs font-sans mt-0.5">{error}</p>
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
    toast.success("Welcome back to GlobeTrotter");
    const next = searchParams.get("next") ?? "/dashboard";
    router.push(next);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <GlassInput
        id="signin-email"
        label="Email Address"
        type="email"
        icon={IconMail}
        placeholder="nomad@example.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <GlassInput
        id="signin-password"
        label="Password"
        type={showPw ? "text" : "password"}
        icon={IconLock}
        placeholder="••••••••"
        error={form.formState.errors.password?.message}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="text-neutral-300 hover:text-white transition-colors"
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
        className="w-full mt-2 py-4 bg-[#2d9b4c] hover:bg-[#38a454] text-white font-medium text-sm rounded-xl transition-all shadow-lg hover:shadow-[#2d9b4c]/30 flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        <span>{form.formState.isSubmitting ? "Signing in..." : "Sign In to Access"}</span>
        <IconArrowRight className="w-4 h-4" />
      </button>

      <div className="mt-4 pt-6 border-t border-white/10 text-center">
        <p className="font-sans text-sm text-neutral-300">
          No account yet?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#72dc85] font-semibold underline decoration-1 underline-offset-4 hover:text-white transition-colors cursor-pointer"
          >
            Create your account
          </button>
        </p>
      </div>
    </form>
  );
}

// ─── Sign Up Panel ────────────────────────────────────────────────────────────

function SignUpPanel({ onSwitch }: { onSwitch: () => void }) {
  const { signUp } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      additionalInfo: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    const metadata = {
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,
      phone_number: data.phone,
      city: data.city,
      country: data.country,
      additional_info: data.additionalInfo || "",
    };
    const { error } = await signUp(data.email, data.password, metadata);
    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }
    toast.success("Account created successfully!", {
      description: "You may now sign in to start your journey.",
    });
    onSwitch();
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput
          id="signup-fname"
          label="First Name"
          icon={IconUser}
          placeholder="First"
          error={form.formState.errors.firstName?.message}
          {...form.register("firstName")}
        />
        <GlassInput
          id="signup-lname"
          label="Last Name"
          placeholder="Last"
          error={form.formState.errors.lastName?.message}
          {...form.register("lastName")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput
          id="signup-email"
          label="Email Address"
          type="email"
          icon={IconMail}
          placeholder="nomad@example.com"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <GlassInput
          id="signup-phone"
          label="Phone Number"
          type="tel"
          icon={IconPhone}
          placeholder="+1 234 567 8900"
          error={form.formState.errors.phone?.message}
          {...form.register("phone")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput
          id="signup-city"
          label="City"
          icon={IconMapPin}
          placeholder="e.g., Paris"
          error={form.formState.errors.city?.message}
          {...form.register("city")}
        />
        <GlassInput
          id="signup-country"
          label="Country"
          placeholder="e.g., France"
          error={form.formState.errors.country?.message}
          {...form.register("country")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-300" htmlFor="signup-info">
          Travel Preferences / Bio
        </label>
        <textarea
          id="signup-info"
          placeholder="Luxury stays, mountain hiking, culinary tours..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-sans text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all resize-none h-20 backdrop-blur-md"
          {...form.register("additionalInfo")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput
          id="signup-password"
          label="Password"
          type={showPw ? "text" : "password"}
          icon={IconLock}
          placeholder="Min. 8 chars"
          error={form.formState.errors.password?.message}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-neutral-300 hover:text-white transition-colors"
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
        <GlassInput
          id="signup-confirm"
          label="Confirm Password"
          type={showPw ? "text" : "password"}
          placeholder="Repeat password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full mt-3 py-4 bg-[#2d9b4c] hover:bg-[#38a454] text-white font-medium text-sm rounded-xl transition-all shadow-lg hover:shadow-[#2d9b4c]/30 flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        <IconSparkles className="w-4 h-4" />
        <span>{form.formState.isSubmitting ? "Registering..." : "Create Voyager Account"}</span>
      </button>

      <div className="mt-2 pt-4 border-t border-white/10 text-center">
        <p className="font-sans text-sm text-neutral-300">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#72dc85] font-semibold underline decoration-1 underline-offset-4 hover:text-white transition-colors cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AuthPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "signin"
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "signup") setTab("signup");
    else if (t === "signin") setTab("signin");
  }, [searchParams]);

  const headings = {
    signin: { title: "Welcome Back", sub: "Access your luxury itineraries, travel stories, and AI assistant." },
    signup: { title: "Join GlobeTrotter", sub: "Create your verified traveler profile and start planning journeys." },
  };

  return (
    <div className="bg-[#0a0a0a] text-[#e2e2e2] antialiased min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
      {/* Dynamic Glassmorphism Background Spheres */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#2d9b4c]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#c3eeb4]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-[92%] max-w-[1200px] z-50 flex justify-between items-center px-6 md:px-10 py-4 backdrop-blur-md bg-white/10 border border-white/15 text-white rounded-full mt-6 shadow-xl">
        <Link href="/" className="font-serif text-2xl tracking-tighter font-light">
          GlobeTrotter
        </Link>
        <Link
          href="/"
          className="font-sans text-xs tracking-wider uppercase px-5 py-2.5 bg-white text-[#0a0a0a] rounded-full font-semibold hover:bg-neutral-200 transition-colors"
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
            className="text-center mb-10 max-w-2xl"
          >
            <EditorialHeading className="text-[52px] md:text-[76px] tracking-tight leading-none text-white mb-4 font-thin">
              {headings[tab].title}
            </EditorialHeading>
            <p className="font-sans text-base md:text-lg text-neutral-300">
              {headings[tab].sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Glass Tab Switcher */}
        <div className="flex p-1.5 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full mb-10 shadow-lg">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-8 py-2.5 rounded-full font-sans text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                tab === t
                  ? "bg-[#2d9b4c] text-white shadow-md"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Glass Card */}
        <div className="w-full max-w-[620px] backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative z-20">
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

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans tracking-widest text-sm uppercase">Loading Authentication...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
