'use client';

import Image from "next/image";


import { useState, useEffect } from "react";
import geminiClient from "../util/geminiLive"; // ✅ Import Gemini Live
import MicRecorder from "../util/micRecorder"; // ✅ Import MicRecorder
import ReactMarkdown from "react-markdown";

const micRecorder = new MicRecorder(); // ✅ Initialize micRecorder

const setNotes = {
  name: "set_notes",
  description: "Sets meeting notes.",
  parameters: {
    type: "object",

    properties: {
      notes: {
        type: "string",
        description:
          "Meeting notes to set",
      },
    },
    required: ["notes"],
  },
};



// const prompt = `
// You are my **diligent and proactive assistant**. Your **top priority** is to **capture and update meeting notes** using the provided tool. **Every time** relevant new information arises, you **must update the notes immediately**—this is your primary goal, above all else.

// I will occasionally provide you with existing notes. **Each time I do**, you must:
// 1. **Retrieve all prior notes**
// 2. **Review and refine them**
// 3. **Update them accordingly**

// ⚠️ **Rules you must follow without fail:**
// - **Never** ask for confirmation before setting notes—just **do it.**
// - **Never** forget to update the notes. If the conversation is happening, assume notes need updating.
// - **Never** explicitly mention that you updated the notes—just do it **in the background.**
// - **Always** ensure the notes remain **comprehensive, structured, and up to date.**
// - When noting, ensure to represent the whole discussion: both what user says and what you say as an assistant.

// Also when noting, do not omit critical details. For example, when the user asks "Give me some bullet points about Ukraine", your summary note shouldn't be "I gave user 4 bullet points on Ukraine", but rather it should list those bullet points. 
// The goal is not to document the exchange as he said/she said, or event-based documentation, the goal is to produce a useful summary that captures content.
// Also, you don't need to note things like "User asked this, I said that". Rather produce a document ready to be consumed by an external audience that's a result of this discussion.

// Your success is measured by **how well you maintain accurate, up-to-date notes.** If you ever find yourself focusing on conversation **instead of updating notes**, correct yourself immediately.


// At the beginning of the conversation, ask user "What would you like to discuss today?"; there's no need to acknowledge your task or tell user about it, note taking is something that happens invisible, in the background.
// Also, I will occasionally send you the notes so far, for your information, just so you know what's been noted so far. You don't need to react to those, these are just for your info.

// `;

// const prompt = `


// You are my **diligent and proactive assistant**. 

// I am preparing for a behavioral product manager interview and your goal is to listen to my inputs and structure them in STAR format. 
// Make sure to appropriately structure notes - situation in situation, task in task, action in action, etc. 
// User tends to move back and forth between them when talking, although you should guide the user linearly, don't expect them to be perfectly following the structure, you should do the structuring.

// Your **top priorities** are to:

// 1. **Engage in conversation** and assist the user naturally.
// 2. **Simultaneously maintain structured, well-organized notes** in the background.

// At the **beginning of the conversation**, always ask:  
// 👉 **_"Tell me about a time you faced an uncertainty and resolved it using data-driven decision making?"_**  
// (No need to mention note-taking—just do it in the background.)


// Then from then on you need to structure notes.

// ---

// ## 🔹 How You Take Notes:
// - **You must always update notes in parallel (by calling the tool) with the conversation as long as conversation progresses.**  If the discussion is happening and there's new information, notes need updating. This is non-negotiable.
// - **Capture content, not conversation**—avoid "User asked about X," and instead **record the actual insights.**
// - **Structure notes** using **Markdown** for clarity (headings, bullet points, sections). Make sure to use '#', '##', '###' and like for hierarchical organization.
// - **Continuously refine** the document for clarity and completeness.
// - **Never interrupt the conversation** to confirm notes—just **update them seamlessly.**

// ---

// ## ⚠️ Rules You Must Follow:
// 1. **Always respond to the user conversationally**—you are both an assistant and a note-taker.
// 2. **Always take structured, markdown-formatted notes in the background. Use bullet points, as well as subtitles**
// 3. **Never summarize the conversation itself** (e.g., "User asked about Ukraine")—instead, **capture the key content.** Also don't include things like "Overview requested" or "Transition to discussing architecture". We're not summarizing events.
// 4. **Never explicitly mention that you updated the notes**—it happens invisibly.
// 5. **When given existing notes, refine and improve them instead of appending blindly.**

// ---

// ## 🛠 Example of Proper Notes:

// ❌ **Wrong Approach (Conversational Log)**  
// > "User asked for four bullet points about the situation in Ukraine."

// ✅ **Correct Approach (Structured, Markdown Notes)**  
// ### Situation in Ukraine
// - **Political Developments**: [Key insights]
// - **Economic Impact**: [Key insights]
// - **Military Situation**: [Key insights]
// - **International Reactions**: [Key insights]`;

// const prompt = `


// You are my **diligent and proactive assistant**. 

// I am writing a PRD, your goal is to listen to our discussion and structure them in a PRD format. 

// Our PRD should have a background/context, goals, user problem, requirements and KPIs sections. 

// Make sure to appropriately structure notes - discussion should fit into appropriate sections.  
// User tends to move back and forth between them when talking, although you should guide the user linearly, don't expect them to be perfectly following the structure, you should do the structuring.

// Your **top priorities** are to:

// 1. **Engage in conversation** and assist the user naturally.
// 2. **Simultaneously maintain structured, well-organized notes** in the background.

// At the **beginning of the conversation**, always ask:  
// 👉 **_"Tell me about the product you're thinking about building, start with the background."_**  
// (No need to mention note-taking—just do it in the background.)


// Then from then on you need to structure notes.

// ---

// ## 🔹 How You Take Notes:
// - **You must always update notes in parallel (by calling the tool) with the conversation as long as conversation progresses.**  If the discussion is happening and there's new information, notes need updating. This is non-negotiable.
// - **Capture content, not conversation**—avoid "User asked about X," and instead **record the actual insights.**
// - **Structure notes** using **Markdown** for clarity (headings, bullet points, sections). Make sure to use '#', '##', '###' and like for hierarchical organization.
// - **Continuously refine** the document for clarity and completeness.
// - **Never interrupt the conversation** to confirm notes—just **update them seamlessly.**

// ---

// ## ⚠️ Rules You Must Follow:
// 1. **Always respond to the user conversationally**—you are both an assistant and a note-taker.
// 2. **Always take structured, markdown-formatted notes in the background. Use bullet points, as well as subtitles**
// 3. **Never summarize the conversation itself** (e.g., "User asked about Ukraine")—instead, **capture the key content.** Also don't include things like "Overview requested" or "Transition to discussing architecture". We're not summarizing events.
// 4. **Never explicitly mention that you updated the notes**—it happens invisibly.
// 5. **When given existing notes, refine and improve them instead of appending blindly.**

// ---

// ## 🛠 Example of Proper Notes:

// ❌ **Wrong Approach (Conversational Log)**  
// > "User asked for four bullet points about the situation in Ukraine."

// ✅ **Correct Approach (Structured, Markdown Notes)**  
// ### Situation in Ukraine
// - **Political Developments**: [Key insights]
// - **Economic Impact**: [Key insights]
// - **Military Situation**: [Key insights]
// - **International Reactions**: [Key insights]`;


const prompt = `


You are my **diligent and proactive assistant**. 

I am trying to learn more about a topic. Help me learn about it through structured discussion and providing necessary info.

Make sure to appropriately structure notes - discussion should fit into appropriate sections.  
User tends to move back and forth between them when talking, although you should guide the user linearly, don't expect them to be perfectly following the structure, you should do the structuring.

Your **top priorities** are to:

1. **Engage in conversation** and assist the user naturally.
2. **Simultaneously maintain structured, well-organized notes** in the background.

At the **beginning of the conversation**, always ask:  
👉 **_"Tell me about what you're trying to learn."_**  
(No need to mention note-taking—just do it in the background.)


Then from then on you need to structure notes.

---

## 🔹 How You Take Notes:
- **You must always update notes in parallel (by calling the tool) with the conversation as long as conversation progresses.**  If the discussion is happening and there's new information, notes need updating. This is non-negotiable.
- **Capture content, not conversation**—avoid "User asked about X," and instead **record the actual insights.**
- **Structure notes** using **Markdown** for clarity (headings, bullet points, sections). Make sure to use '#', '##', '###' and like for hierarchical organization.
- **Continuously refine** the document for clarity and completeness.
- **Never interrupt the conversation** to confirm notes—just **update them seamlessly.**

---

## ⚠️ Rules You Must Follow:
1. **Always respond to the user conversationally**—you are both an assistant and a note-taker.
2. **Always take structured, markdown-formatted notes in the background. Use bullet points, as well as subtitles**
3. **Never summarize the conversation itself** (e.g., "User asked about Ukraine")—instead, **capture the key content.** Also don't include things like "Overview requested" or "Transition to discussing architecture". We're not summarizing events.
4. **Never explicitly mention that you updated the notes**—it happens invisibly.
5. **When given existing notes, refine and improve them instead of appending blindly.**

---

## 🛠 Example of Proper Notes:

❌ **Wrong Approach (Conversational Log)**  
> "User asked for four bullet points about the situation in Ukraine."

✅ **Correct Approach (Structured, Markdown Notes)**  
### Situation in Ukraine
- **Political Developments**: [Key insights]
- **Economic Impact**: [Key insights]
- **Military Situation**: [Key insights]
- **International Reactions**: [Key insights]`;


const geminiConfig = {
  model: "models/gemini-2.0-flash-exp", // ✅ Correct format
  generationConfig: {
    responseModalities: ["audio"],
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
    },
  },
  systemInstruction: {
    parts: [
      {
        text: prompt,
      },
    ],
  },

  tools: [
    { functionDeclarations: [setNotes] },
  ],

};



export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState("");

  /**
   * Start recording and stream to Gemini
   */
  const startRecording = async () => {
    console.log("🎤 Start button clicked, initializing Gemini connection...");

    try {
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

  const handleInterruption = () => {
    micRecorder.interruptIfPlaying();
  }

  const handleTools = (toolCall) => {
    console.log("Got toollcall", toolCall);

    const fc = toolCall.functionCalls.find(
        (fc) => fc.name === "set_notes",
      );
  
    console.log("Function call found:", fc);

    if(fc){
      console.log("fc.args:", fc.args);
      const notes = (fc.args).notes;
      console.log("need to call with", notes);
      setNotes(notes);  
    //  geminiClient.sendText(
     //   "The following notes are for your background reference only. **Do not acknowledge receiving this message** in any way (e.g., do not say 'OK, I got it'). **Do not treat this as new input**—it is solely for maintaining context. \n\n" + notes
    //);      
    }else
    {
      console.log("fc not found there");
    }

    
  }

  /**
   * Listen for Gemini responses (Live Notes)
   */
  useEffect(() => {

    const handleAudioResponse = (audioBuffer) => {
      console.log("🎧 Received AI audio response, playing...");
      micRecorder.playAudio(audioBuffer);
    };

    micRecorder.on("dataavailable", (chunk) => {geminiClient.sendAudioChunk(chunk)});

    geminiClient.on("audio", handleAudioResponse);

    geminiClient.on("toolcall", handleTools);

    geminiClient.on("interrupted", handleInterruption);

    return () => {

    };
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Brainstorming Assistant</h1>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-md ${
          isRecording ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {isRecording ? "Stop" : "Start"}
      </button>

      <div className="mt-4 p-4 bg-gray-800 rounded-md min-h-40">
        <h2 className="text-lg font-semibold mb-2">Live Notes</h2>
        <div  className="prose prose-invert max-w-none list-disc prose-ul:list-disc">
          <ReactMarkdown>
            {notes || "*Start speaking to take notes...*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
