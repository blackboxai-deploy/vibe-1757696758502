"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ChatMessage from "@/components/ChatMessage";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import VoiceControls from "@/components/VoiceControls";
import { 
  createSpeechRecognition, 
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeech,
  getPreferredVoice,
  type SpeechRecognitionEvent,
  type SpeechRecognitionErrorEvent,
  AudioLevelDetector
} from "@/lib/speechUtils";
import type { ChatMessage as ChatMessageType, ChatResponse } from "@/app/api/chat/route";

export default function VoiceChat() {
  // State management
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(`You are a helpful and friendly AI voice assistant. You provide clear, concise, and conversational responses that sound natural when spoken aloud. 

Key guidelines:
- Keep responses conversational and natural for voice interaction
- Avoid overly technical jargon unless requested
- Be encouraging and supportive in your tone
- Provide helpful and accurate information
- If you're unsure about something, say so clearly
- Keep responses reasonably concise for voice interaction (1-3 sentences typically)
- Use a warm, friendly tone that feels personal and engaging

Remember: Your responses will be converted to speech, so write in a way that sounds good when spoken.`);

  // Refs
  const recognitionRef = useRef<any>(null);
  const audioDetectorRef = useRef<AudioLevelDetector | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check browser support
  const [speechSupport, setSpeechSupport] = useState({
    recognition: false,
    synthesis: false
  });

  useEffect(() => {
    setSpeechSupport({
      recognition: isSpeechRecognitionSupported(),
      synthesis: isSpeechSynthesisSupported()
    });

    // Initialize audio level detector
    audioDetectorRef.current = new AudioLevelDetector();

    return () => {
      if (audioDetectorRef.current) {
        audioDetectorRef.current.cleanup();
      }
      stopSpeech();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!speechSupport.recognition) return null;

    const recognition = createSpeechRecognition();
    if (!recognition) return null;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
      
      if (currentTranscript.trim()) {
        handleSendMessage(currentTranscript.trim());
        setCurrentTranscript("");
      }
    };

    return recognition;
  }, [speechSupport.recognition, currentTranscript]);

  // Start voice recording
  const startRecording = useCallback(async () => {
    if (!speechSupport.recognition || isRecording) return;

    try {
      // Initialize audio level detection
      if (audioDetectorRef.current) {
        await audioDetectorRef.current.initialize();
        audioDetectorRef.current.startMonitoring(setAudioLevel);
      }

      const recognition = initializeSpeechRecognition();
      if (!recognition) {
        setError("Failed to initialize speech recognition");
        return;
      }

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setCurrentTranscript("");
      setError(null);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError("Failed to start recording. Please check microphone permissions.");
      setIsRecording(false);
    }
  }, [speechSupport.recognition, isRecording, initializeSpeechRecognition]);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioDetectorRef.current) {
      audioDetectorRef.current.stopMonitoring();
    }
    
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  // Send message to AI
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt
        }),
      });

      const data: ChatResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiMessage: ChatMessageType = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the AI response if synthesis is supported
      if (speechSupport.synthesis && data.message) {
        handleSpeakMessage(data.message);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  }, [messages, systemPrompt, isProcessing, speechSupport.synthesis]);

  // Speak AI message
  const handleSpeakMessage = useCallback(async (text: string) => {
    if (!speechSupport.synthesis || isSpeaking) return;

    try {
      setIsSpeaking(true);
      const preferredVoice = getPreferredVoice();
      
      await speakText(text, {
        voice: preferredVoice || undefined,
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8
      });
      
    } catch (error) {
      console.error('Error speaking message:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [speechSupport.synthesis, isSpeaking]);

  // Stop current speech
  const handleStopSpeech = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  // Handle text input submit
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleSendMessage(textInput);
      setTextInput("");
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    setError(null);
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        
        {/* System Prompt Configuration */}
        <Card className="p-4 bg-white/5 border-white/20">
          <div className="mb-2">
            <label className="text-sm font-medium text-white/80">AI Personality & Instructions:</label>
          </div>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-white/50 min-h-[120px]"
            placeholder="Customize how the AI should behave and respond..."
          />
        </Card>

        {/* Messages Display */}
        <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 rounded-lg bg-white/5 border border-white/20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60 space-y-4">
              <div className="text-6xl">🎤</div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Chat!</h3>
                <p>Press the record button to start a voice conversation, or type your message below.</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                onSpeak={speechSupport.synthesis ? handleSpeakMessage : undefined}
                isSpeaking={isSpeaking}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Visualizer */}
        {isRecording && (
          <VoiceVisualizer 
            isRecording={isRecording}
            audioLevel={audioLevel}
            transcript={currentTranscript}
          />
        )}

        {/* Error Display */}
        {error && (
          <Card className="p-3 bg-red-500/20 border-red-500/50">
            <p className="text-red-200 text-sm">{error}</p>
          </Card>
        )}

        {/* Voice Controls */}
        <VoiceControls
          isRecording={isRecording}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          speechSupport={speechSupport}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onStopSpeech={handleStopSpeech}
        />

        {/* Text Input */}
        <Card className="p-4 bg-white/5 border-white/20">
          <div className="flex gap-2">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type your message here..."
              className="bg-white/10 border-white/20 text-white placeholder-white/50 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-20"
              >
                Send
              </Button>
              <Button 
                onClick={handleClearConversation}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10 min-w-20"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}