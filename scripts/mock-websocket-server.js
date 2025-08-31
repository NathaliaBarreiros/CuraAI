const WebSocket = require("ws")
const fs = require("fs")
const path = require("path")

// Create WebSocket server on port 8080
const wss = new WebSocket.Server({
  port: 8080,
  path: "/audio",
})

console.log("🎤 Mock Medical AI WebSocket Server running on ws://localhost:8080/audio")

// Mock audio responses (you can add more)
const mockResponses = [
  "Hello! I'm your Medical AI Assistant. How can I help you today?",
  "I understand your concern. Can you tell me more about your symptoms?",
  "Based on what you've described, I'd recommend consulting with a healthcare professional.",
  "Is there anything else you'd like to discuss about your health?",
  "Thank you for using the Medical AI Assistant. Take care!",
]

let responseIndex = 0

function generateWAVAudio(frequency = 440, duration = 2, sampleRate = 44100) {
  const numSamples = sampleRate * duration
  const numChannels = 1
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numSamples * blockAlign
  const fileSize = 36 + dataSize

  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  // WAV file header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, fileSize, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true) // PCM format
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(36, "data")
  view.setUint32(40, dataSize, true)

  // Generate sine wave audio data
  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.floor(32767 * Math.sin((2 * Math.PI * frequency * i) / sampleRate))
    view.setInt16(offset, sample, true)
    offset += 2
  }

  return buffer
}

wss.on("connection", function connection(ws, req) {
  console.log("📱 New client connected from:", req.socket.remoteAddress)

  // Send welcome message when client connects
  setTimeout(() => {
    const welcomeMessage = {
      type: "audio_response",
      text: "Medical AI Agent connected successfully. You can start speaking now.",
      timestamp: Date.now(),
    }
    ws.send(JSON.stringify(welcomeMessage))
  }, 1000)

  ws.on("message", function message(data) {
    try {
      // Check if data is binary (Buffer) or text (string)
      if (data instanceof Buffer) {
        console.log("🎵 Received binary audio data, size:", data.length, "bytes")

        // Simulate processing delay for audio
        setTimeout(
          () => {
            const mockAudioResponse = generateWAVAudio(440, 1.5, 44100) // 440Hz tone for 1.5 seconds

            console.log("🤖 Sending mock WAV audio response, size:", mockAudioResponse.byteLength, "bytes")
            ws.send(mockAudioResponse)

            responseIndex++
          },
          1500 + Math.random() * 1000,
        ) // Random delay 1.5-2.5s
      } else {
        // Try to parse as JSON for control messages
        const message = JSON.parse(data.toString())
        console.log("📨 Received JSON message type:", message.type)

        switch (message.type) {
          case "audio_data":
            console.log("🎵 Received audio data, size:", message.data?.length || 0)

            // Simulate processing delay
            setTimeout(
              () => {
                const response = {
                  type: "audio_response",
                  text: mockResponses[responseIndex % mockResponses.length],
                  timestamp: Date.now(),
                  // Mock audio data (in real implementation, this would be actual audio)
                  audioData: "mock_audio_response_" + responseIndex,
                }

                responseIndex++
                ws.send(JSON.stringify(response))
                console.log("🤖 Sent AI response:", response.text)
              },
              1500 + Math.random() * 1000,
            ) // Random delay 1.5-2.5s
            break

          case "start_recording":
            console.log("🎙️ Client started recording")
            ws.send(
              JSON.stringify({
                type: "recording_acknowledged",
                timestamp: Date.now(),
              }),
            )
            break

          case "stop_recording":
            console.log("⏹️ Client stopped recording")
            ws.send(
              JSON.stringify({
                type: "recording_stopped",
                timestamp: Date.now(),
              }),
            )
            break

          default:
            console.log("❓ Unknown message type:", message.type)
        }
      }
    } catch (error) {
      if (!(data instanceof Buffer)) {
        console.error("❌ Error parsing JSON message:", error.message)
      } else {
        console.error("❌ Error processing binary audio data:", error.message)
      }
    }
  })

  ws.on("close", function close() {
    console.log("👋 Client disconnected")
  })

  ws.on("error", function error(err) {
    console.error("🚨 WebSocket error:", err)
  })
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down mock server...")
  wss.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})
