'use client';

import { useState, useEffect } from "react";
import geminiClient from "../util/geminiLive"; 
import MicRecorder from "../util/micRecorder"; 
import ReactMarkdown from "react-markdown";
import TemplateSelector from "../components/TemplateSelector"; 

const micRecorder = new MicRecorder(); 

const setNotesSchema = {
  name: "set_notes",
  description: "Sets meeting notes.",
  parameters: {
    type: "object",
    properties: {
      notes: {
        type: "string",
        description: "Meeting notes to set",
      },
    },
    required: ["notes"],
  },
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState("");
  const [prompt, setPrompt] = useState("");

  /**
   * Start recording and stream to Gemini
   */
  const startRecording = async () => {
    console.log("🎤 Start button clicked, initializing Gemini connection...");

    try {
      const geminiConfig = {
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
        },
        systemInstruction: {
          parts: [{ text: prompt }],
        },
        tools: [{ functionDeclarations: [setNotesSchema] }],
      };

      await geminiClient.connect(geminiConfig); // ✅ Ensure WebSocket is connected
      console.log("✅ Connected to Gemini, starting recording...");

      await micRecorder.startRecording(); // ✅ Start Mic Recording

      setIsRecording(true);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  /**
   * Stop recording
   */
  const stopRecording = async () => {
    console.log("⏹️ Stop button clicked...");
    await micRecorder.stopRecording(); // ✅ Stop Mic Recording
    geminiClient.disconnect(); // ✅ Stop WebSocket
    setIsRecording(false);
  };

  const handleTools = (toolCall) => {
    console.log("Tool call");
    
    const fc = toolCall.functionCalls.find((fc) => fc.name === "set_notes");

    if (fc) {
      const newNotes = fc.args.notes;
      setNotes(newNotes);
    }
  };

  /**
   * Listen for Gemini responses (Live Notes)
   */
  useEffect(() => {
    const handleAudioResponse = (audioBuffer) => {
      console.log("🎧 Received AI audio response, playing...");
      micRecorder.playAudio(audioBuffer);
    };
    
    const handleInterrupt = () => {
      console.log("Handle Interrupt called")
      micRecorder.stopPlayback();
    };

    micRecorder.on("dataavailable", (chunk) => {
      geminiClient.sendAudioChunk(chunk);
    });

    geminiClient.on("audio", handleAudioResponse);
    geminiClient.on("toolcall", handleTools);
    geminiClient.on("interrupted", handleInterrupt);
    return () => {};
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">EchoBrain</h1>

      {/* ✅ Template Selector */}
      <TemplateSelector onSelect={setPrompt} />

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-md ${
          isRecording ? "bg-red-600" : "bg-indigo-600"
        }`}
      >
        {isRecording ? "Stop" : "Start"}
      </button>

      <div className="mt-4 p-4 bg-gray-800 rounded-md min-h-40">
        <h2 className="text-lg font-semibold mb-2">Live Notes</h2>
        <div className="prose prose-invert max-w-none list-disc prose-ul:list-disc">
          <ReactMarkdown>
            {notes || "*Start speaking to take notes...*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}