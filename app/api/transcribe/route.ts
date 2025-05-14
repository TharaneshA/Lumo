import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const huggingFaceToken = process.env.HUGGING_FACE_API_TOKEN;
    if (!huggingFaceToken) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing API token' },
        { status: 500 }
      );
    }

    const huggingFaceFormData = new FormData();
    huggingFaceFormData.append('file', audioFile); // Correct usage

    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${huggingFaceToken}`,
        },
        body: huggingFaceFormData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Transcription service error: ${result.error || response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ text: result.text || '' });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: `Transcription failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
