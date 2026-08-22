"use client";

import React from "react";
import Link from "next/link";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconArrowRight } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  email: z.string().email("Valid email address required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    login(data.email);
    toast.success("Welcome back", {
      description: `Logged in as ${data.email}`,
    });
    router.push("/dashboard");
  };

  return (
    <div className="bg-[#0e0e0e] text-[#e2e2e2] antialiased min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-[1200px] z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-[#c3eeb4] text-[#002200] rounded-full mt-6 mx-auto">
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

      <main className="w-full max-w-[1200px] px-6 md:px-12 z-10 flex flex-col items-center pt-[150px] pb-32">
        <div className="text-center mb-16 max-w-2xl">
          <EditorialHeading className="text-[64px] md:text-[96px] tracking-tight leading-none text-white mb-6 font-thin">
            Welcome Back
          </EditorialHeading>
          <p className="font-sans text-xl text-[#becabb]">
            Access your curated itineraries and exclusive travel concierge.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[480px] bg-white rounded-none shadow-2xl shadow-black/50 p-10 relative z-20">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm text-[#020202]" htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="nomad@example.com"
                className="w-full px-4 py-4 bg-transparent border border-[#020202] rounded-none font-sans text-sm text-[#020202] placeholder:text-[#889486] focus:ring-1 focus:ring-[#020202] focus:border-[#020202] transition-colors"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-[#93000a] text-xs font-sans mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-sans text-sm text-[#020202]" htmlFor="password">Password</label>
                <a className="font-sans text-sm text-[#020202] hover:opacity-70 transition-opacity underline decoration-1 underline-offset-4" href="#">Forgot Password?</a>
              </div>
              <input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-4 bg-transparent border border-[#020202] rounded-none font-sans text-sm text-[#020202] placeholder:text-[#889486] focus:ring-1 focus:ring-[#020202] focus:border-[#020202] transition-colors"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-[#93000a] text-xs font-sans mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 py-4 bg-[#2d9b4c] text-white rounded-none font-sans text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2 rounded-[10px]"
            >
              Login
              <IconArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-[#efefe7] text-center">
            <p className="font-sans text-sm text-[#020202]">
              Don&apos;t have an account? 
              <a className="font-sans text-sm ml-2 underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity" href="#">Signup</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
