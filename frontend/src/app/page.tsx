"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  Layers,
  Database,
  FormInput,
  Flame,
  ArrowRight,
} from "lucide-react";

// Schema for form validation using Zod
const destinationFormSchema = z.object({
  city: z
    .string()
    .min(2, { message: "City name must be at least 2 characters." }),
  country: z
    .string()
    .min(2, { message: "Country name must be at least 2 characters." }),
});

type DestinationFormValues = z.infer<typeof destinationFormSchema>;

const techStack = [
  { name: "Next.js 16 (App Router)", icon: Layers, status: "Active" },
  { name: "TypeScript", icon: CheckCircle2, status: "Active" },
  { name: "Tailwind CSS v4", icon: Flame, status: "Active" },
  { name: "shadcn/ui", icon: Sparkles, status: "Active" },
  { name: "Motion", icon: Flame, status: "Active" },
  { name: "TanStack Query v5", icon: Database, status: "Active" },
  { name: "React Hook Form", icon: FormInput, status: "Active" },
  { name: "Zod Validation", icon: CheckCircle2, status: "Active" },
];

export default function Home() {
  const [submittedList, setSubmittedList] = useState<DestinationFormValues[]>([
    { city: "Tokyo", country: "Japan" },
    { city: "Paris", country: "France" },
  ]);

  // TanStack Query demonstration
  const { data: serverStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["app-health"],
    queryFn: async () => {
      // Simulate quick health check query
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { status: "Online", latency: "18ms", timestamp: new Date().toISOString() };
    },
  });

  // React Hook Form + Zod integration
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: {
      city: "",
      country: "",
    },
  });

  const onSubmit = (data: DestinationFormValues) => {
    setSubmittedList((prev) => [data, ...prev]);
    toast.success(`Destination added: ${data.city}, ${data.country}!`);
    reset();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Motion */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-md mb-4 text-xs font-medium text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GlobeTrotter Stack Initialized</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Frontend Setup Complete
        </h1>
        <p className="text-neutral-400 mt-3 text-sm md:text-base">
          Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Motion,
          TanStack Query, React Hook Form, and Zod are fully wired and working.
        </p>
      </motion.div>

      {/* Tech Stack Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {techStack.map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm"
            >
              <div className="p-2 rounded-lg bg-neutral-800 text-indigo-400">
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-neutral-200">
                  {tech.name}
                </p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  ● Ready
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Main Interactive Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Demo with RHF + Zod + shadcn */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-neutral-800 bg-neutral-900/70 backdrop-blur-md text-neutral-100 h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Add Destination</CardTitle>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                  RHF + Zod
                </Badge>
              </div>
              <CardDescription className="text-neutral-400 text-xs">
                Test form validation and state handling with typed schemas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="dest-form">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs text-neutral-300">
                    City Name
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Kyoto"
                    className="bg-neutral-950/60 border-neutral-800 focus-visible:ring-indigo-500 text-sm"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-400">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs text-neutral-300">
                    Country Name
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g. Japan"
                    className="bg-neutral-950/60 border-neutral-800 focus-visible:ring-indigo-500 text-sm"
                    {...register("country")}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-400">{errors.country.message}</p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="dest-form"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
              >
                Add Destination <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* TanStack Query & Motion List Demo */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {/* Query Status Card */}
          <Card className="border-neutral-800 bg-neutral-900/70 backdrop-blur-md text-neutral-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  TanStack Query Status
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    isStatusLoading
                      ? "border-amber-500/30 text-amber-400"
                      : "border-emerald-500/30 text-emerald-400"
                  }
                >
                  {isStatusLoading ? "Fetching..." : "Connected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-neutral-400 pt-0">
              {isStatusLoading ? (
                <p>Simulating asynchronous cache fetch...</p>
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    Status: <strong className="text-neutral-200">{serverStatus?.status}</strong>
                  </span>
                  <span>
                    Latency: <strong className="text-neutral-200">{serverStatus?.latency}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Animated Destination Feed */}
          <Card className="border-neutral-800 bg-neutral-900/70 backdrop-blur-md text-neutral-100 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Live Destinations (Motion Animated)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {submittedList.map((item, idx) => (
                <motion.div
                  key={`${item.city}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-xs"
                >
                  <div className="font-medium text-neutral-200">{item.city}</div>
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px]">
                    {item.country}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
