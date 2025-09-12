import { NextRequest, NextResponse } from 'next/server';

export interface SpeechRequest {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface SpeechResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpeechRequest = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Text is required and cannot be empty',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // Since we're using browser-native speech synthesis on the client side,
    // this API endpoint serves as a validation layer and could be extended
    // for server-side text-to-speech if needed in the future.
    
    // For now, we'll validate the text and return success
    // The actual speech synthesis happens on the client using Web Speech API
    
    const cleanText = text.trim();
    
    if (cleanText.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text is too long. Maximum 5000 characters allowed.',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // Return success - client will handle the actual speech synthesis
    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      // In a future enhancement, this could return an actual audio URL
      // from a server-side text-to-speech service
    });

  } catch (error) {
    console.error('Speech API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for checking speech synthesis capabilities
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Speech synthesis API is available',
    features: {
      clientSideSynthesis: true,
      serverSideSynthesis: false, // Could be enabled in future
      supportedFormats: ['web-speech-api'],
      maxTextLength: 5000
    },
    timestamp: Date.now()
  });
}