"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email address required"),
  message: z.string().min(10, "Inquiry details required"),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ConciergeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConciergeModal({ isOpen, onOpenChange }: ConciergeModalProps) {
  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onContactSubmit = (data: ContactForm) => {
    toast.success("Concierge inquiry sent", {
      description: `Thank you, ${data.name}. Our private office will be in touch shortly.`,
    });
    contactForm.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-apple border border-white/15 text-white max-w-md p-8 rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight text-white">
            Private Concierge Office
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400 font-light mt-1">
            Direct access for private charters, resort buyouts, and custom arrangements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="concierge-name" className="text-xs text-neutral-300">
              Full Name
            </Label>
            <Input
              id="concierge-name"
              placeholder="Alexander Wright"
              className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
              {...contactForm.register("name")}
            />
            {contactForm.formState.errors.name && (
              <p className="text-xs text-red-400">{contactForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="concierge-email" className="text-xs text-neutral-300">
              Email Address
            </Label>
            <Input
              id="concierge-email"
              type="email"
              placeholder="name@domain.com"
              className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
              {...contactForm.register("email")}
            />
            {contactForm.formState.errors.email && (
              <p className="text-xs text-red-400">{contactForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="concierge-message" className="text-xs text-neutral-300">
              Private Requirement
            </Label>
            <textarea
              id="concierge-message"
              rows={3}
              placeholder="Specify your private travel requirement..."
              className="w-full rounded-xl border border-white/10 glass-apple-subtle p-3 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
              {...contactForm.register("message")}
            />
            {contactForm.formState.errors.message && (
              <p className="text-xs text-red-400">{contactForm.formState.errors.message.message}</p>
            )}
          </div>
          <div className="pt-3">
            <Button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-medium text-sm py-3.5 rounded-full transition-all cursor-pointer"
            >
              Send Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
