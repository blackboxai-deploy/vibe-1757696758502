import { NextRequest, NextResponse } from 'next/server';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, systemPrompt } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Messages array is required and cannot be empty',
          message: '',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // Default system prompt for voice AI assistant
    const defaultSystemPrompt = `You are a helpful and friendly AI voice assistant. You provide clear, concise, and conversational responses that sound natural when spoken aloud. 

Key guidelines:
- Keep responses conversational and natural for voice interaction
- Avoid overly technical jargon unless requested
- Be encouraging and supportive in your tone
- Provide helpful and accurate information
- If you're unsure about something, say so clearly
- Keep responses reasonably concise for voice interaction (1-3 sentences typically)
- Use a warm, friendly tone that feels personal and engaging

Remember: Your responses will be converted to speech, so write in a way that sounds good when spoken.`;

    // Prepare messages for the API
    const apiMessages = [
      {
        role: 'system',
        content: systemPrompt || defaultSystemPrompt
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenRouter API via custom endpoint
    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SSHVdSNfvRMpe1',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'openrouter/claude-sonnet-4',
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      return NextResponse.json(
        {
          success: false,
          error: `AI service error: ${response.status}`,
          message: '',
          timestamp: Date.now()
        },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    
    // Extract the message from the AI response
    const aiMessage = aiResponse.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
      console.error('Invalid AI response format:', aiResponse);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response format from AI service',
          message: '',
          timestamp: Date.now()
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      message: aiMessage.trim(),
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: '',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}