"use client";

import { Card } from "@/components/ui/card";

interface VoiceVisualizerProps {
  isRecording: boolean;
  audioLevel: number;
  transcript: string;
}

export default function VoiceVisualizer({ isRecording, audioLevel, transcript }: VoiceVisualizerProps) {
  // Generate bars for the audio visualization
  const generateBars = () => {
    const bars = [];
    const numBars = 12;
    
    for (let i = 0; i < numBars; i++) {
      // Create varied heights based on audio level and some randomness
      const baseHeight = 20;
      const maxHeight = 80;
      const variation = Math.sin((Date.now() / 200) + i) * 0.3 + 0.7; // Smooth animation
      const height = baseHeight + (audioLevel * maxHeight * variation);
      
      bars.push(
        <div
          key={i}
          className={`bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-150 ${
            isRecording ? 'animate-pulse' : ''
          }`}
          style={{
            height: `${Math.max(baseHeight, Math.min(height, maxHeight))}px`,
            width: '4px',
            animationDelay: `${i * 50}ms`
          }}
        />
      );
    }
    
    return bars;
  };

  return (
    <Card className="p-6 bg-white/5 border-white/20 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
          }`}></div>
          <span className="text-white/80 font-medium">
            {isRecording ? 'Listening...' : 'Recording Stopped'}
          </span>
        </div>
      </div>

      {/* Audio Visualization */}
      <div className="flex items-center justify-center mb-6 h-20">
        <div className="flex items-end gap-1 h-full">
          {generateBars()}
        </div>
      </div>

      {/* Audio Level Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Audio Level</span>
          <span className="text-white/60 text-sm">{Math.round(audioLevel * 100)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-200"
            style={{ width: `${audioLevel * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Real-time Transcript */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Live Transcript:</span>
          {isRecording && (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
        
        <div className="min-h-[60px] p-3 rounded-lg bg-white/5 border border-white/10">
          {transcript ? (
            <p className="text-white leading-relaxed">
              {transcript}
              {isRecording && (
                <span className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse"></span>
              )}
            </p>
          ) : (
            <p className="text-white/40 italic">
              {isRecording ? 'Start speaking...' : 'No speech detected'}
            </p>
          )}
        </div>
      </div>

      {/* Recording Stats */}
      {transcript && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs text-white/50">
            <span>Words: {transcript.split(' ').filter(word => word.length > 0).length}</span>
            <span>Characters: {transcript.length}</span>
          </div>
        </div>
      )}

      {/* Visual Effects */}
      {isRecording && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg animate-pulse"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
    </Card>
  );
}