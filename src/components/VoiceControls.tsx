"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  speechSupport: {
    recognition: boolean;
    synthesis: boolean;
  };
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStopSpeech: () => void;
}

export default function VoiceControls({
  isRecording,
  isProcessing,
  isSpeaking,
  speechSupport,
  onStartRecording,
  onStopRecording,
  onStopSpeech
}: VoiceControlsProps) {

  return (
    <Card className="p-6 bg-white/5 border-white/20">
      <div className="flex flex-col items-center space-y-4">
        
        {/* Main Voice Control Button */}
        <div className="relative">
          <Button
            size="lg"
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={!speechSupport.recognition || isProcessing}
            className={`w-20 h-20 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20'
            }`}
          >
            {isRecording ? (
              // Stop icon
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            ) : (
              // Microphone icon
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </Button>

          {/* Recording pulse ring */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Button Label */}
        <div className="text-center">
          <p className="text-white font-medium">
            {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Press to Speak'}
          </p>
          <p className="text-white/60 text-sm mt-1">
            {isRecording ? 'Tap to stop recording' : 'Hold or tap to start voice input'}
          </p>
        </div>

        {/* Additional Controls */}
        <div className="flex gap-3">
          
          {/* Stop Speech Button */}
          {isSpeaking && (
            <Button
              size="sm"
              variant="outline"
              onClick={onStopSpeech}
              className="border-white/20 text-white/80 hover:bg-white/10"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h12v12H6z"/>
              </svg>
              Stop Speaking
            </Button>
          )}

          {/* Status Indicators */}
          <div className="flex gap-2">
            <div className={`px-2 py-1 rounded-full text-xs ${
              speechSupport.recognition 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              Voice Input {speechSupport.recognition ? '✓' : '✗'}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${
              speechSupport.synthesis 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              Voice Output {speechSupport.synthesis ? '✓' : '✗'}
            </div>
          </div>
        </div>

        {/* Browser Support Warnings */}
        {(!speechSupport.recognition || !speechSupport.synthesis) && (
          <Card className="p-3 bg-yellow-500/10 border-yellow-500/30 max-w-md">
            <div className="text-center">
              <p className="text-yellow-400 font-medium text-sm mb-2">Limited Browser Support</p>
              <div className="text-yellow-300/80 text-xs space-y-1">
                {!speechSupport.recognition && (
                  <p>• Voice recognition not supported in this browser</p>
                )}
                {!speechSupport.synthesis && (
                  <p>• Voice synthesis not supported in this browser</p>
                )}
                <p className="mt-2 italic">Try Chrome, Edge, or Safari for full functionality</p>
              </div>
            </div>
          </Card>
        )}

        {/* Keyboard Shortcuts */}
        <div className="text-center">
          <p className="text-white/40 text-xs">
            Keyboard shortcuts: Space to record, Enter to send text
          </p>
        </div>
      </div>
    </Card>
  );
}