# Lumo Transcription Backend

This is the FastAPI backend service for Lumo's voice transcription feature. It uses OpenAI's Whisper model (large-v3-turbo) for accurate speech-to-text conversion.

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python main.py
```

The server will run on `http://localhost:8000`

## API Endpoints

### POST /transcribe
- Accepts audio files (MP3 format recommended)
- Returns transcribed text
- Request must be multipart/form-data with 'audio' field

## Environment Variables

No environment variables are required as the Whisper model is run locally.

## Logging

Logs are written to:
- Console output
- `transcription.log` file

Logs include:
- Model initialization
- Request processing
- Transcription status
- Error details

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful transcription
- 400: Invalid request
- 500: Server/processing error

Detailed error messages are included in the response body.