import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// FastAPI backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Transcription API route called');
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.error('No audio file provided in request');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log(`Received audio file: name=${audioFile.name}, type=${audioFile.type}, size=${audioFile.size} bytes`);

    // No need for Hugging Face token anymore as we're using our own backend

    // Create a new FormData instance for the FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append('audio', audioFile);
    
    console.log(`Sending audio file to backend: ${BACKEND_URL}/transcribe`);
    
    // Send to FastAPI backend
    const response = await axios.post(
      `${BACKEND_URL}/transcribe`,
      backendFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000, // Increased timeout for larger files
      }
    );

    console.log(`Hugging Face API response status: ${response.status}`);
    const result = response.data;
    console.log('API response data:', JSON.stringify(result));

    if (result.error) {
      console.error(`Transcription service error: ${result.error}`);
      return NextResponse.json(
        { error: `Transcription service error: ${result.error}` },
        { status: 500 }
      );
    }

    console.log(`Transcription successful: "${result.text || ''}"`); 
    return NextResponse.json({ text: result.text || '' });
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    // Log more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx range
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', JSON.stringify(error.response.headers));
      console.error('Error response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    return NextResponse.json(
      { error: `Transcription failed: ${error.message}` },
      { status: 500 }
    );
  }
}
