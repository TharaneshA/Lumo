from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers.models.auto.modeling_auto import AutoModelForSpeechSeq2Seq
from transformers.models.auto.processing_auto import AutoProcessor
from transformers.pipelines import pipeline
from typing import Dict, Union, Any
from transformers.pipelines.base import Pipeline
import torch
import logging
import os
from datetime import datetime
import numpy as np
from datasets import Audio, load_dataset
from io import BytesIO
import ffmpeg
import soundfile as sf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('transcription.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Whisper model
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

logger.info(f"Using device: {device} with dtype: {torch_dtype}")

def initialize_model() -> Pipeline:
    try:
        model_id = "openai/whisper-large-v3-turbo"
        logger.info(f"Loading model: {model_id}")
        
        model = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_id, 
            torch_dtype=torch_dtype, 
            low_cpu_mem_usage=True, 
            use_safetensors=True
        )
        model.to(device)
        
        processor = AutoProcessor.from_pretrained(model_id)
        
        pipe = pipeline(
            "automatic-speech-recognition",
            model=model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            torch_dtype=torch_dtype,
            device=device,
        )
        
        logger.info("Model initialized successfully")
        return pipe
    except Exception as e:
        logger.error(f"Error initializing model: {str(e)}")
        raise

# Initialize the model at startup
pipe = initialize_model()

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        logger.info(f"Received audio file: {audio.filename}")
        
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        # Read audio content into memory
        content = await audio.read()
        audio_bytes = BytesIO(content)
        
        try:
            # Load audio data using soundfile
            audio_data, sample_rate = sf.read(audio_bytes)
            
            # Ensure audio is in the correct format (mono, 16kHz)
            if len(audio_data.shape) > 1:
                audio_data = audio_data.mean(axis=1)  # Convert to mono
            
            logger.info("Starting transcription")
            # Convert audio data to the format expected by the pipeline
            result = pipe({"sampling_rate": sample_rate, "array": audio_data})
            
            logger.info("Transcription completed")
            
            # Handle different possible return types from the pipeline
            if isinstance(result, dict) and "text" in result:
                transcribed_text = result["text"]
            elif isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict):
                transcribed_text = result[0].get("text", "")
            else:
                transcribed_text = str(result)

            logger.info(f"Transcription completed. Length: {len(transcribed_text)} characters")
            
            return {"text": transcribed_text}
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
