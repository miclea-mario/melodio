"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileSetupPage() {
  const router = useRouter();
  const updateProfile = useMutation(api.userProfile.updateProfile);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [occupation, setOccupation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateProfile({
        name: name.trim(),
        gender: gender || undefined,
        occupation: occupation.trim() || undefined,
      });

      // Redirect to home
      router.push("/");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0c2234] to-[#0d3d3d] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-slate-900/80 backdrop-blur-md border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400/30 to-teal-600/30 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-teal-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Welcome to Melodio
            </h1>
            <p className="text-slate-400">
              Let's personalize your meditation experience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Your Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-slate-100 focus:border-teal-500"
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-slate-200">
                Gender (Optional)
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-slate-200">
                Occupation (Optional)
              </Label>
              <Input
                id="occupation"
                type="text"
                placeholder="e.g., Software Engineer, Teacher"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-slate-100 focus:border-teal-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white py-6 text-lg shadow-lg shadow-teal-500/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-slate-500 text-center mt-6">
            Your information is used to personalize your meditation sessions
          </p>
        </Card>
      </motion.div>

      {/* Mist Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-t from-transparent via-teal-500/10 to-transparent"
        />
      </div>
    </div>
  );
}

