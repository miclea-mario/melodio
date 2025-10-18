"use client";

import { MoodCard } from "@/components/MoodCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuestionAnswer {
  question: string;
  answer: string;
}

export default function MoodProfilingPage() {
  const router = useRouter();
  const generateQuestion = useAction(api.meditation.generateMoodQuestion);
  const analyzeMood = useAction(api.meditation.analyzeMoodProfile);

  const [conversationHistory, setConversationHistory] = useState<QuestionAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preSessionRating, setPreSessionRating] = useState<number | null>(null);
  const [showRatingFirst, setShowRatingFirst] = useState(true);

  const maxQuestions = 4; // Rating + 3 AI-generated questions
  const totalProgress = preSessionRating ? conversationHistory.length + 1 : conversationHistory.length;
  const progress = (totalProgress / maxQuestions) * 100;

  // Load first AI question after rating is provided
  useEffect(() => {
    if (preSessionRating && conversationHistory.length === 0 && !currentQuestion && !isLoading && !showRatingFirst) {
      loadNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSessionRating, showRatingFirst]);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedOption(null);

    try {
      const result = await generateQuestion({
        conversationHistory,
      });

      setCurrentQuestion(result.question);
      setCurrentOptions(result.options);
    } catch (err) {
      console.error("Error loading question:", err);
      setError("Failed to load question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleRatingSelect = (rating: number) => {
    setPreSessionRating(rating);
    setShowRatingFirst(false);
    // Will trigger the useEffect to load first AI question
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const newHistory = [
      ...conversationHistory,
      { question: currentQuestion, answer: selectedOption },
    ];

    setConversationHistory(newHistory);
    setSelectedOption(null);

    // Check if we've asked enough questions (3 AI questions after the rating)
    if (newHistory.length >= maxQuestions - 1) {
      // Analyze mood and redirect to meditation
      await finalizeMoodProfile(newHistory);
    } else {
      // Load next question with updated history
      setIsLoading(true);
      setError(null);

      try {
        const result = await generateQuestion({
          conversationHistory: newHistory,
        });

        setCurrentQuestion(result.question);
        setCurrentOptions(result.options);
      } catch (err) {
        console.error("Error loading question:", err);
        setError("Failed to load question. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const finalizeMoodProfile = async (history: QuestionAnswer[]) => {
    setIsLoading(true);
    try {
      const analysis = await analyzeMood({
        conversationHistory: history,
      });

      // Store mood data in session storage for the meditation page
      sessionStorage.setItem(
        "moodProfile",
        JSON.stringify({
          questions: history,
          summary: analysis.summary,
          themes: analysis.themes,
          meditationType: analysis.meditationType,
          preSessionRating: preSessionRating,
        })
      );

      // Navigate to meditation page
      router.push("/meditation");
    } catch (err) {
      console.error("Error analyzing mood:", err);
      setError("Failed to analyze your mood. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0c2234] to-[#0d3d3d] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Mood Check-In</h1>
          <p className="text-slate-400">
          Let&apos;s understand how you&apos;re feeling today ({Math.min(totalProgress + 1, maxQuestions)}/{maxQuestions})
          </p>
          <Progress value={progress} className="mt-4 h-2 bg-slate-700/50 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-teal-400 [&>[data-slot=progress-indicator]]:to-teal-500 [&>[data-slot=progress-indicator]]:shadow-lg [&>[data-slot=progress-indicator]]:shadow-teal-500/50" />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {showRatingFirst ? (
              <motion.div
                key="rating"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Rating Question */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-semibold text-slate-100 mb-2">
                    How do you feel right now?
                  </h2>
                  <p className="text-slate-400 text-sm">Rate from 1 (very bad) to 10 (excellent)</p>
                </motion.div>

                {/* Rating Options (1-10) */}
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating, index) => (
                    <motion.button
                      key={rating}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => handleRatingSelect(rating)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        preSessionRating === rating
                          ? "border-teal-400 bg-teal-500/20 shadow-lg shadow-teal-500/50"
                          : "border-slate-700 bg-slate-800/50 hover:border-teal-500/50"
                      }`}
                    >
                      <span className="text-2xl font-bold text-slate-100">{rating}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">
                  {conversationHistory.length >= maxQuestions
                    ? "Analyzing your mood..."
                    : "Preparing your question..."}
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={loadNextQuestion} variant="outline">
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Question */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-semibold text-slate-100 mb-2">
                    {currentQuestion}
                  </h2>
                </motion.div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {currentOptions.map((option, index) => (
                    <MoodCard
                      key={option}
                      option={option}
                      index={index}
                      onSelect={() => handleOptionSelect(option)}
                      isSelected={selectedOption === option}
                    />
                  ))}
                </div>

                {/* Next Button */}
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      onClick={handleNext}
                      size="lg"
                      className="bg-teal-600 hover:bg-teal-500 text-white gap-2 shadow-lg shadow-teal-500/30"
                    >
                      {conversationHistory.length >= maxQuestions - 2 ? "Begin Meditation" : "Next"}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mist Overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-teal-500/5 to-transparent opacity-30" />
      </div>
    </div>
  );
}

