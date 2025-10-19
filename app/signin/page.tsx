"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    
    try {
      await signIn("password", formData);
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a1628]">
      {/* Animated Serene Gradient Background - Same as home page */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient layer */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
        />
        
        {/* Secondary gradient layer */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute inset-0"
        />
        
        {/* Tertiary gradient layer */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 70% 70%, rgba(20, 184, 166, 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.08) 0%, transparent 60%)",
            ],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
            >
              <Image
                src="/logo.svg"
                alt="Melodio Logo"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </motion.div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Melodio</h1>
            <p className="text-slate-400">AI-Powered Meditation</p>
          </motion.div>

          {/* Sign In/Up Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-100 mb-1">
                {flow === "signIn" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-slate-400 text-sm">
                {flow === "signIn"
                  ? "Sign in to continue your journey"
                  : "Begin your meditation journey"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                    className="pl-10 bg-slate-900/50 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="pl-10 bg-slate-900/50 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-medium py-6 rounded-lg shadow-lg shadow-teal-500/30 transition-all"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span>{flow === "signIn" ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{flow === "signIn" ? "Sign In" : "Sign Up"}</span>
                  </>
                )}
              </Button>

              {/* Toggle Flow */}
              <div className="text-center pt-2">
                <p className="text-slate-400 text-sm">
                  {flow === "signIn"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  {" "}
                  <button
                    type="button"
                    onClick={() => {
                      setFlow(flow === "signIn" ? "signUp" : "signIn");
                      setError(null);
                    }}
                    className="text-teal-400 hover:text-teal-300 font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    {flow === "signIn" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-slate-500 text-sm mt-6"
          >
            Find your inner peace with AI-guided meditation
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
