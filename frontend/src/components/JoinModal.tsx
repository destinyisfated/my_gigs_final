"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  CheckCircle,
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  CreditCard,
  Zap,
  ArrowRight,
  RefreshCw,
  Phone,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PaymentStep = "input" | "processing" | "success" | "failed";

export default function JoinModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { user } = useUser();

  // Logic States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount] = useState("1"); // Set to fixed 250 as per UI design
  const [step, setStep] = useState<PaymentStep>("input");
  const [pollingId, setPollingId] = useState<string | null>(null);

  // UI States
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(60);

  // Reset modal state on open
  useEffect(() => {
    if (open) {
      setStep("input");
      setProgress(0);
      setCountdown(60);
      setPollingId(null);
    }
  }, [open]);

  // Polling & Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let pollInterval: NodeJS.Timeout;

    if (step === "processing") {
      // Countdown timer UI
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
        setProgress((prev) => Math.min(prev + 1.67, 100));
      }, 1000);

      // Backend Polling Logic
      if (pollingId) {
        pollInterval = setInterval(() => {
          checkTransactionStatus(pollingId);
        }, 3000);
      }
    }

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, [step, pollingId]);

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const checkTransactionStatus = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/check-status/${id}/`
      );
      if (!response.ok) return;

      const data = await response.json();

      if (data.status === "success") {
        setStep("success");
        setTimeout(() => {
          onOpenChange(false);
          navigate("/freelancer/create-profile");
        }, 2500);
      } else if (data.status === "failed") {
        setStep("failed");
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  };

  const handleSubmit = async () => {
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid M-Pesa number",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    setProgress(0);
    setCountdown(60);

    try {
      const response = await fetch("http://localhost:8000/api/stk-push/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: `254${cleanPhone}`,
          amount: amount,
          clerk_id: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPollingId(data.CheckoutRequestID);
        toast({
          title: "STK Push Sent",
          description: "Enter your M-Pesa PIN on your phone.",
        });
      } else {
        setStep("failed");
        toast({
          title: "Payment Error",
          description:
            data.CustomerMessage || "Failed to initiate M-Pesa prompt.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStep("failed");
      toast({
        title: "Network Error",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 border-border/50 bg-card overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {/* Header */}
              <div className="relative -mx-6 -mt-6 mb-6 p-6 pb-8 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-b border-border/50">
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                    <Smartphone className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-foreground mb-1">
                      Become a Freelancer
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Complete registration to start freelancing
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Summary Card */}
                <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-5 border border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Annual Fee
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                          KSh {amount}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Yearly
                        </Badge>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="bg-background/50 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" /> Unlimited Gigs
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-background/50 text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" /> Verified Profile
                    </Badge>
                  </div>
                </div>

                {/* Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" /> M-Pesa Phone
                    Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-4 bg-muted/50 rounded-xl border font-medium text-muted-foreground">
                      +254
                    </div>
                    <Input
                      type="tel"
                      placeholder="712 345 678"
                      value={formatPhoneDisplay(phoneNumber)}
                      onChange={(e) =>
                        setPhoneNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 9)
                        )
                      }
                      className="flex-1 h-12 text-lg font-medium rounded-xl border-input"
                    />
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={phoneNumber.length < 9}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Pay KSh {amount} with M-Pesa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Steps Info */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> How it works
                  </p>
                  <div className="space-y-2">
                    {[
                      "Enter your M-Pesa number and click Pay",
                      "Check your phone for the M-Pesa prompt",
                      "Enter M-Pesa PIN to complete payment",
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="mb-8">
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Smartphone className="h-12 w-12 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Check Your Phone</h3>
                <p className="text-muted-foreground">
                  Enter your PIN to complete payment
                </p>
              </div>
              <div className="space-y-4 mb-8">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Waiting for confirmation...{" "}
                  {countdown}s
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-success flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-6">
                Redirecting you to dashboard...
              </p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
            </motion.div>
          )}

          {step === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
              <p className="text-muted-foreground mb-6">
                Something went wrong. Please try again.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setStep("input")}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
