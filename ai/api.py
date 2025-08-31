from fastapi import FastAPI, WebSocket, Request
from fastapi.templating import Jinja2Templates
from audio_processor import transcribe_audio
import speech_recognition as sr
import wave
import io
import asyncio
from agent import create_agent, render_conversation, conversation
from agents import Runner
import wave
import os
import av

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

async def chat_endpoint(user_input: str):
    conversation.append(("User: ", user_input))
    conv_text = render_conversation(conversation)
    agente = create_agent(conv_text, user_input)
    response = await Runner.run(agente, input=user_input)
    os.remove("userInput.wav")
    if isinstance(response.final_output, str):
        conversation.append(("CuraAI: ", response.final_output))
    return {"response": response.final_output, "conversation": conversation}

def webm_bytes_to_wav(webm_bytes: bytes, wav_path: str, rate=16000):
    container = av.open(io.BytesIO(webm_bytes), mode="r", format="webm")
    audio_stream = next((s for s in container.streams if s.type == "audio"), None)
    if audio_stream is None:
        raise RuntimeError("No se encontró stream de audio en el WebM.")

    resampler = av.audio.resampler.AudioResampler(format="s16", layout="mono", rate=rate)

    pcm_chunks = []

    for packet in container.demux(audio_stream):
        for frame in packet.decode():
            out = resampler.resample(frame)
            if not out:
                continue
            frames = out if isinstance(out, list) else [out]
            for f in frames:
                arr = f.to_ndarray()  
                if arr.ndim == 2:
                    arr = arr[0]       
                pcm_chunks.append(arr.tobytes())

    
    out = resampler.resample(None)
    if out:
        frames = out if isinstance(out, list) else [out]
        for f in frames:
            arr = f.to_ndarray()
            if arr.ndim == 2:
                arr = arr[0]
            pcm_chunks.append(arr.tobytes())

    container.close()

    with wave.open(wav_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)   
        wf.setframerate(rate)
        wf.writeframes(b"".join(pcm_chunks))

    return wav_path

@app.websocket("/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    timeout_seconds = 3

    while True:
        audio_buffer = bytearray()
        try:
            while True:
                try:
                    data = await asyncio.wait_for(websocket.receive_bytes(), timeout=timeout_seconds)
                    print(f"Received {len(data)} bytes of audio data")
                    audio_buffer.extend(data)
                except asyncio.TimeoutError:
                    print("No bytes received in 3 seconds. Ending recording.")
                    break

        except Exception as e:
            print(f"WebSocket error: {e}")
            break  

        if audio_buffer:
            try:
                out = webm_bytes_to_wav(bytes(audio_buffer), "userInput.wav", rate=16000)
                print(f"Audio convertido a {out}")
                transcription = transcribe_audio(out)
                await chat_endpoint(transcription)
            except Exception as e:
                print("Error decodificando WebM/Opus:", e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)