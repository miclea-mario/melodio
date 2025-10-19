"use client";

import { MoodCard } from "@/components/MoodCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface StandardQuestion {
  question: string;
  options: string[];
}

// Standard mood profiling questions
const STANDARD_QUESTIONS: StandardQuestion[] = [
  {
    question: "What brings you here today?",
    options: [
      "Feeling stressed or overwhelmed",
      "Dealing with anxiety or worry",
      "Having trouble sleeping",
      "Need to improve focus",
      "Just want to relax and unwind",
      "Feeling low or down"
    ]
  },
  {
    question: "How would you describe your energy level right now?",
    options: [
      "Exhausted and drained",
      "Low energy",
      "Somewhat tired",
      "Neutral",
      "Energized",
      "Very energetic"
    ]
  },
  {
    question: "What's happening in your mind at this moment?",
    options: [
      "Racing thoughts I can't control",
      "Worrying about the future",
      "Replaying past events",
      "Feeling scattered and unfocused",
      "Mind feels foggy or unclear",
      "Relatively calm and present"
    ]
  },
  {
    question: "How is your body feeling?",
    options: [
      "Tense and tight",
      "Restless or fidgety",
      "Heavy and sluggish",
      "Uncomfortable or in pain",
      "Neutral, no strong sensations",
      "Relaxed and comfortable"
    ]
  },
  {
    question: "What's your primary goal for this session?",
    options: [
      "Release stress and tension",
      "Calm anxious thoughts",
      "Prepare for better sleep",
      "Boost focus and clarity",
      "Find inner peace",
      "Practice self-compassion"
    ]
  },
  {
    question: "How much time can you dedicate to this session?",
    options: [
      "Just a few minutes (5-10 min)",
      "Short session (10-15 min)",
      "Standard session (15-20 min)",
      "Extended session (20-30 min)",
      "Long session (30+ min)"
    ]
  }
];

// Analyze mood based on answers
function analyzeMoodProfile(answers: QuestionAnswer[], rating: number) {
  const themes: string[] = [];
  let meditationType = "general-wellness";
  
  // Analyze based on what brings them here
  const mainReason = answers[0]?.answer.toLowerCase() || "";
  if (mainReason.includes("stress") || mainReason.includes("overwhelmed")) {
    themes.push("stress");
    meditationType = "stress-relief";
  }
  if (mainReason.includes("anxiety") || mainReason.includes("worry")) {
    themes.push("anxiety");
    meditationType = "anxiety-reduction";
  }
  if (mainReason.includes("sleep")) {
    themes.push("sleep");
    meditationType = "sleep";
  }
  if (mainReason.includes("focus")) {
    themes.push("focus");
    meditationType = "focus";
  }
  if (mainReason.includes("low") || mainReason.includes("down")) {
    themes.push("low mood");
    meditationType = "mood-lifting";
  }
  
  // Analyze energy level
  const energy = answers[1]?.answer.toLowerCase() || "";
  if (energy.includes("exhausted") || energy.includes("drained") || energy.includes("low")) {
    themes.push("fatigue");
  }
  
  // Analyze mental state
  const mentalState = answers[2]?.answer.toLowerCase() || "";
  if (mentalState.includes("racing") || mentalState.includes("scattered")) {
    themes.push("mental restlessness");
  }
  if (mentalState.includes("worrying")) {
    themes.push("worry");
  }
  if (mentalState.includes("foggy") || mentalState.includes("unclear")) {
    themes.push("mental clarity needed");
  }
  
  // Analyze physical state
  const physicalState = answers[3]?.answer.toLowerCase() || "";
  if (physicalState.includes("tense") || physicalState.includes("tight")) {
    themes.push("physical tension");
  }
  if (physicalState.includes("restless")) {
    themes.push("restlessness");
  }
  
  // Generate summary based on rating and answers
  let summary = "";
  if (rating <= 3) {
    summary = `You're going through a challenging time right now. Your responses indicate ${themes.slice(0, 2).join(" and ")}. This meditation will help you find relief and support.`;
  } else if (rating <= 5) {
    summary = `You're feeling somewhat low today. Let's work on ${themes.slice(0, 2).join(" and ")} to help you feel better.`;
  } else if (rating <= 7) {
    summary = `You're doing okay, but there's room for improvement. We'll focus on ${themes.slice(0, 2).join(" and ")} to enhance your wellbeing.`;
  } else {
    summary = `You're feeling pretty good! This session will help maintain your positive state and deepen your sense of ${themes[0] || "peace"}.`;
  }
  
  return {
    summary,
    themes: themes.slice(0, 3),
    meditationType
  };
}

export default function MoodProfilingPage() {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1); // -1 for rating
  const [conversationHistory, setConversationHistory] = useState<QuestionAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preSessionRating, setPreSessionRating] = useState<number | null>(null);

  const totalQuestions = STANDARD_QUESTIONS.length + 1; // +1 for rating
  const currentProgress = currentQuestionIndex + 1;
  const progress = (currentProgress / totalQuestions) * 100;

  const currentQuestion = currentQuestionIndex >= 0 
    ? STANDARD_QUESTIONS[currentQuestionIndex] 
    : null;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleRatingSelect = (rating: number) => {
    setPreSessionRating(rating);
    setSelectedOption(null);
    setCurrentQuestionIndex(0);
  };

  const handleNext = () => {
    if (!selectedOption || !currentQuestion) return;

    const newHistory = [
      ...conversationHistory,
      { question: currentQuestion.question, answer: selectedOption },
    ];

    setConversationHistory(newHistory);
    setSelectedOption(null);

    // Check if we've completed all questions
    if (currentQuestionIndex >= STANDARD_QUESTIONS.length - 1) {
      finalizeMoodProfile(newHistory);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const finalizeMoodProfile = (history: QuestionAnswer[]) => {
    setIsLoading(true);
    
    const analysis = analyzeMoodProfile(history, preSessionRating || 5);

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
            Let&apos;s understand how you&apos;re feeling today ({currentProgress}/{totalQuestions})
          </p>
          <Progress value={progress} className="mt-4 h-2 bg-slate-700/50 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-teal-400 [&>[data-slot=progress-indicator]]:to-teal-500 [&>[data-slot=progress-indicator]]:shadow-lg [&>[data-slot=progress-indicator]]:shadow-teal-500/50" />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {currentQuestionIndex === -1 ? (
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
                <p className="text-slate-400">Analyzing your mood...</p>
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key={currentQuestionIndex}
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
                    {currentQuestion.question}
                  </h2>
                </motion.div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, index) => (
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
                      {currentQuestionIndex >= STANDARD_QUESTIONS.length - 1 ? "Begin Meditation" : "Next"}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : null}
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

