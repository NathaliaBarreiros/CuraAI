"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseWebSocketAudioOptions {
  serverUrl?: string
  onConnectionOpen?: () => void
  onConnectionClose?: () => void
  onError?: (error: Event) => void
  onAudioReceived?: (audioBlob: Blob) => void
}

interface UseWebSocketAudioReturn {
  isConnected: boolean
  isRecording: boolean
  isPlaying: boolean
  connect: () => Promise<void>
  disconnect: () => void
  startRecording: () => Promise<void>
  stopRecording: () => void
  playReceivedAudio: (audioData: ArrayBuffer) => Promise<void>
}

export const useWebSocketAudio = (options: UseWebSocketAudioOptions = {}): UseWebSocketAudioReturn => {
  const {
    serverUrl = "ws://localhost:8080/audio",
    onConnectionOpen,
    onConnectionClose,
    onError,
    onAudioReceived,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume()
    }
  }, [])

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      await initializeAudioContext()

      wsRef.current = new WebSocket(serverUrl)

      wsRef.current.binaryType = "arraybuffer"

      wsRef.current.onopen = () => {
        console.log("[v0] WebSocket connected for audio communication")
        setIsConnected(true)
        onConnectionOpen?.()
      }

      wsRef.current.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        setIsConnected(false)
        onConnectionClose?.()
      }

      wsRef.current.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
        onError?.(error)
      }

      wsRef.current.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) {
          console.log("[v0] Received audio data:", event.data.byteLength, "bytes")
          await playReceivedAudio(event.data)
          onAudioReceived?.(new Blob([event.data], { type: "audio/wav" }))
        }
      }
    } catch (error) {
      console.error("[v0] Failed to connect WebSocket:", error)
    }
  }, [serverUrl, onConnectionOpen, onConnectionClose, onError, onAudioReceived, initializeAudioContext])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsConnected(false)
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected")
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          console.log("[v0] Sending audio chunk:", event.data.size, "bytes")
          wsRef.current.send(event.data)
        }
      }

      mediaRecorder.start(100) // Send data every 100ms
      setIsRecording(true)
      console.log("[v0] Started recording audio")
    } catch (error) {
      console.error("[v0] Failed to start recording:", error)
      throw error
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setIsRecording(false)
      console.log("[v0] Stopped recording audio")
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [isRecording])

  const playReceivedAudio = useCallback(
    async (audioData: ArrayBuffer) => {
      if (!audioContextRef.current) {
        await initializeAudioContext()
      }

      try {
        setIsPlaying(true)
        const audioBuffer = await audioContextRef.current!.decodeAudioData(audioData.slice(0))
        const source = audioContextRef.current!.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current!.destination)

        source.onended = () => {
          setIsPlaying(false)
          console.log("[v0] Finished playing received audio")
        }

        source.start()
        console.log("[v0] Playing received audio")
      } catch (error) {
        console.error("[v0] Failed to play audio:", error)
        setIsPlaying(false)
      }
    },
    [initializeAudioContext],
  )

  useEffect(() => {
    return () => {
      disconnect()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [disconnect])

  return {
    isConnected,
    isRecording,
    isPlaying,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    playReceivedAudio,
  }
}
