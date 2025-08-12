import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import dotenv from "dotenv";
import { spawn, execSync } from "child_process";

dotenv.config();

const apiKey = process.env.DEEPGRAM_API_KEY;
if (!apiKey) {
    console.error("❌ Missing DEEPGRAM_API_KEY in .env");
    process.exit(1);
}

function getAudioDevice(): { ffmpegArgs: string[], name: string } {
    return {
        name: "Microphone (Realtek(R) Audio)",
        // Use NATIVE format - no conversion!
        ffmpegArgs: [
            "-f", "dshow",
            "-i", "audio=Microphone (Realtek(R) Audio)",
            "-f", "s16le",           // Raw PCM
            "-acodec", "pcm_s16le",  // Explicit codec
            "-ar", "44100",          // Native sample rate (same as test)
            "-ac", "2",              // Native stereo (same as test)
            "pipe:1",
        ],
    };
}

const live = async () => {
    const deepgram = createClient(apiKey);

    // Configure Deepgram for your native audio format
    const connection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        interim_results: true,
        // Match your microphone's native format
        encoding: "linear16",
        sample_rate: 44100,      // Native rate
        channels: 2,             // Native stereo
        punctuate: true,
        endpointing: 300,
        utterance_end_ms: 1000,
    });

    let audioChunksReceived = 0;

    connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("🔗 Deepgram connection opened");
        
        const { ffmpegArgs, name } = getAudioDevice();
        console.log(`🎙 Using native format: ${name}`);
        console.log(`📋 Command: ffmpeg ${ffmpegArgs.join(' ')}`);

        const ffmpeg = spawn("ffmpeg", ffmpegArgs, { 
            stdio: ["ignore", "pipe", "pipe"]
        });

        ffmpeg.stdout.on("data", (chunk: Buffer) => {
            audioChunksReceived++;
            
            // Log first few chunks to confirm data flow
            if (audioChunksReceived <= 3) {
                console.log(`🎵 Audio chunk #${audioChunksReceived}: ${chunk.length} bytes`);
            }

            if (connection.getReadyState() === 1) {
              //@ts-ignore
                connection.send(chunk);
            }
        });

        ffmpeg.on("close", (code: number) => {
            console.log(`🔚 FFmpeg ended: ${code}`);
            connection.finish();
        });

        // Check data flow
        setTimeout(() => {
            if (audioChunksReceived === 0) {
                console.error("🚨 NO AUDIO DATA - Check FFmpeg stdout");
            } else {
                console.log(`✅ Audio flowing: ${audioChunksReceived} chunks received`);
            }
        }, 3000);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && transcript.trim() !== "") {
            console.log("📝 TRANSCRIPT:", transcript);
        }
    });

    connection.on(LiveTranscriptionEvents.Close, (closeEvent: any) => {
        console.log("🔒 Connection closed:", closeEvent);
    });

    connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error("❌ Error:", error);
    });

    const cleanup = () => {
        console.log("\n🛑 Stopping...");
        connection.finish();
        process.exit(0);
    };

    process.on("SIGINT", cleanup);
};

live().catch(console.error);
