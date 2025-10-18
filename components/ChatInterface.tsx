"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface Message {
  text: string;
  isAgent: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export function ChatInterface({ messages, isOpen, onClose }: ChatInterfaceProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 z-20"
        >
          <Card className="h-full rounded-none border-l border-slate-700 bg-slate-900/95 backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Meditation Guide</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-slate-400 text-center text-sm mt-8">
                    Your conversation will appear here
                  </p>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.isAgent ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isAgent
                            ? "bg-teal-900/30 border border-teal-700/30 text-slate-100"
                            : "bg-slate-700/50 text-slate-200"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Voice-only mode • Transcripts shown here
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

