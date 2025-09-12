"use client";

import { useState, useEffect } from "react";
import VoiceChat from "@/components/VoiceChat";

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/70">Loading Voice AI Assistant...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Speak Naturally, Get
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Intelligent Responses</span>
            </h2>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              Experience the future of AI conversation with advanced voice capabilities. 
              Simply speak your thoughts and get thoughtful, contextual responses powered by cutting-edge AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Voice Recognition
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                AI Conversation
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                Natural Speech
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex">
        <div className="w-full">
          <VoiceChat />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/50 text-sm">
            Powered by advanced AI • Speak freely, think clearly
          </p>
        </div>
      </footer>
    </div>
  );
}