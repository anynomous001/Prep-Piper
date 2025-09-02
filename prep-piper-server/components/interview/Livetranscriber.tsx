"use client"

import { useState, useEffect, useRef } from "react"
import { Deepgram } from "@deepgram/sdk"

export function LiveTranscriber() {
  const [transcript, setTranscript] = useState<string>("")
  const [listening, setListening] = useState(false)
  const deepgramRef = useRef<Deepgram>()
  const socketRef = useRef<WebSocket>()
  const mediaStreamRef = useRef<MediaStream>()
  const audioContextRef = useRef<AudioContext>()
  const processorRef = useRef<ScriptProcessorNode>()

  useEffect(() => {
    // Initialize Deepgram client once
    deepgramRef.current = new Deepgram(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!)
    return () => {
      // Clean up on unmount
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
      socketRef.current?.close()
    }
  }, [])

  const startListening = async () => {
    if (listening) return
    setTranscript("")
    setListening(true)

    // 1. Open microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaStreamRef.current = stream

    // 2. Create AudioContext at 16kHz
    const audioCtx = new AudioContext({ sampleRate: 16000 })
    audioContextRef.current = audioCtx
    const source = audioCtx.createMediaStreamSource(stream)

    // 3. Create Deepgram live socket
    const dg = deepgramRef.current!
    const dgSocket = dg.transcription.live({
      encoding: "linear16",
      sampleRate: 16000,
      model: "nova-2",
      language: "en-US",
      interim_results: true,
      punctuate: true,
      profanity_filter: false,
    })
    socketRef.current = dgSocket

    // 4. Send mic audio into Deepgram socket
    const processor = audioCtx.createScriptProcessor(4096, 1, 1)
    processorRef.current = processor
    source.connect(processor)
    processor.connect(audioCtx.destination)

    processor.onaudioprocess = (evt) => {
      const channelData = evt.inputBuffer.getChannelData(0)
      // Convert Float32Array [-1,1] → 16-bit PCM
      const pcm = new Int16Array(channelData.length)
      for (let i = 0; i < channelData.length; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]))
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      dgSocket.send(Buffer.from(pcm.buffer))
    }

    // 5. Handle transcription events
    dgSocket.addEventListener("message", (msgEvent) => {
      const msg = JSON.parse(msgEvent.data as string)
      if (msg.channel?.alternatives?.[0]?.transcript) {
        const text = msg.channel.alternatives[0].transcript
        setTranscript((t) => msg.is_final ? t + text + "\n" : t + text)
      }
    })

    dgSocket.addEventListener("open", () => console.log("Deepgram socket open"))
    dgSocket.addEventListener("close", () => console.log("Deepgram socket closed"))
    dgSocket.addEventListener("error", (err) => console.error("Deepgram error", err))
  }

  const stopListening = () => {
    setListening(false)
    processorRef.current?.disconnect()
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    socketRef.current?.close()
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Live STT from Microphone</h2>
      <div className="my-2">
        {listening 
          ? <button onClick={stopListening} className="px-4 py-2 bg-red-500 text-white">Stop</button>
          : <button onClick={startListening} className="px-4 py-2 bg-green-500 text-white">Start</button>
        }
      </div>
      <textarea
        className="w-full h-64 p-2 border"
        value={transcript}
        readOnly
      />
    </div>
  )
}
