"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChatMessage } from "@/app/api/chat/route";

interface ChatMessageProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
  isSpeaking: boolean;
}

export default function ChatMessage({ message, onSpeak, isSpeaking }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`p-4 ${
          isUser 
            ? 'bg-blue-600/80 border-blue-500/50' 
            : 'bg-white/10 border-white/20'
        }`}>
          
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isUser 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              }`}>
                {isUser ? 'U' : 'AI'}
              </div>
              <span className="text-xs text-white/60">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              {timestamp && (
                <span className="text-xs text-white/40">
                  {timestamp}
                </span>
              )}
            </div>

            {/* Voice Controls for AI Messages */}
            {!isUser && onSpeak && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSpeak(message.content)}
                  disabled={isSpeaking}
                  className="text-white/60 hover:text-white hover:bg-white/10 h-7 px-2"
                  title="Speak this message"
                >
                  {isSpeaking ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Speaking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                      <span className="text-xs">Speak</span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className={`text-sm leading-relaxed ${
            isUser ? 'text-white' : 'text-white/90'
          }`}>
            {formatMessage(message.content)}
          </div>

          {/* Message Metadata */}
          <div className="mt-2 flex justify-between items-center">
            <div className="text-xs text-white/40">
              {message.content.length} characters
            </div>
            
            {!isUser && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-white/50">AI Generated</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'order-1 mr-3' : 'order-2 ml-3'
      } ${
        isUser 
          ? 'bg-blue-600/50 border border-blue-400/50' 
          : 'bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-400/50'
      }`}>
        {isUser ? (
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )}
      </div>
    </div>
  );
}