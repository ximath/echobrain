import { EventEmitter } from "eventemitter3";

const GEMINI_LIVE_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 


export class GeminiLiveClient extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.isStreaming = false;
    this.audioQueue = [];
    this.isSendingAudio = false; // Flag to manage the delay
    this.config = null;
    this.accumulatedBuffer = new Uint8Array(0); // Buffer accumulator
    this.chunkSize = 4096; // Increase chunk size
    this.config = null;

  }

  log(type, message) {
    const log = { date: new Date(), type, message };
    this.emit("log", log);
  }



  sendText(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not open, cannot send text.");
      return;
    }

    const message = {
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(message));
    console.log("📨 Sent text message to Gemini:", text);
  }

  async connect(config) {

    this.config = config;

    return new Promise((resolve, reject) => {
      if (this.isStreaming) {
        console.warn("⚠️ Already connected to Gemini WebSocket.");
        return resolve();
      }

      if (!API_KEY) {
        console.error("❌ Missing API key! Check .env file.");
        return reject("Missing API key");
      }

      const url = `${GEMINI_LIVE_URL}?key=${API_KEY}`;
      console.log(`🌐 Connecting to Gemini WebSocket: ${url}`);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected!");
       
        const setupMessage = { setup: this.config };

        this.ws.send(JSON.stringify(setupMessage));
        console.log("📨 Sent setup message to Gemini:", setupMessage);

        this.isStreaming = true;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.warn(
          `⚠️ WebSocket closed: ${event.reason || "No reason provided"}`
        );
        this.isStreaming = false;
      };

      this.ws.onmessage = (event) => {
        //console.log("📩 WebSocket message received:", event);
        this._handleMessage(event);
      };
    });
  }

  disconnect() {
    if (this.ws) {
      console.log("🔌 Closing WebSocket connection...");
      this.ws.close();
      this.isStreaming = false;
    }
  }

  _concatenateBuffers(buffer1, buffer2) {
    // Ensure buffer1 and buffer2 are Uint8Arrays
    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);

    let newBuffer = new Uint8Array(view1.length + view2.length);
    newBuffer.set(view1, 0);
    newBuffer.set(view2, view1.length);
    
    return newBuffer;
    }

  async sendAudioChunk(pcmBuffer) {
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not open, queuing audio chunk...");
      this.audioQueue.push(pcmBuffer);
      return;
    }

    this.accumulatedBuffer = this._concatenateBuffers(this.accumulatedBuffer, pcmBuffer);

    if (this.accumulatedBuffer.length >= this.chunkSize) 
    {
        
        const chunkToSend = this.accumulatedBuffer.slice(0, this.chunkSize);
        this.accumulatedBuffer = this.accumulatedBuffer.slice(this.chunkSize);
    
        this.audioQueue.push(chunkToSend);
        this._processAudioQueue();
    }

  }

  async _processAudioQueue() {
    if (this.isSendingAudio || this.audioQueue.length === 0) {
      return;
    }

    this.isSendingAudio = true;
    while (this.audioQueue.length > 0) {
      const pcmBuffer = this.audioQueue.shift();

      const base64Output = arrayBufferToBase64(pcmBuffer);

      const message = {
        realtimeInput: {
          mediaChunks: [
            {
              mimeType: "audio/pcm;rate=16000", // ✅ Gemini expects PCM; format
              data: base64Output,
            },
          ],
        },
      };

      this.ws.send(JSON.stringify(message));
      //console.log("📨 Sent PCM audio chunk to Gemini.");
      await new Promise((resolve) => setTimeout(resolve, 50)); // 1s delay
    }
    this.isSendingAudio = false;
  }

  async _handleMessage(event) {
    try {
      const response = await blobToJSON(event.data);

      if (isSetupCompleteMessage(response)) {
        this.emit("setupcomplete");
        return;
      }

      if (isToolCallMessage(response)) {
        console.log("server.toolCall", response);
        this.emit("toolcall", response.toolCall);
        return;
      }
      
      if (isServerContentMessage(response)) {
        const { serverContent } = response;

        if (isInterrupted(serverContent)) {
          console.log("⚠️ Response interrupted.");
          this.emit("interrupted");
          return;
        }

        if (isTurnComplete(serverContent)) {
          console.log("✅ Turn complete.");
          this.emit("turncomplete");
        }

        if (isModelTurn(serverContent)) {
          let parts = serverContent.modelTurn.parts;

          const audioParts = parts.filter(
            (p) => p.inlineData && p.inlineData.mimeType.startsWith("audio/pcm")
          );
          audioParts.forEach((p) => {
            if (p.inlineData?.data) {
              const audioBuffer = base64ToArrayBuffer(p.inlineData.data);
                
              this.emit("audio", audioBuffer);
             
            }
          });

          const textResponse = parts
            .filter((p) => p.text)
            .map((p) => p.text)
            .join(" ");

          if (textResponse) {
            console.log("📝 AI Notes:", textResponse);
            this.emit("content", textResponse);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error handling message:", err);
    }
  }
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

export const blobToJSON = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const json = JSON.parse(reader.result);
          resolve(json);
        } else {
          reject("❌ Failed to parse JSON");
        }
      };
      reader.readAsText(blob);
    });

    

function isSetupCompleteMessage(response) {
  return typeof response === "object" && response !== null && "setupComplete" in response;
}

function isServerContentMessage(response) {
  return typeof response === "object" && response !== null && "serverContent" in response;
}

function isToolCallMessage(response) {
    return typeof response === "object" && response !== null && "toolCall" in response;
}

function isInterrupted(serverContent) {
  return serverContent.interrupted === true;
}

function isTurnComplete(serverContent) {
  return serverContent.turnComplete === true;
}


function isModelTurn(serverContent) {
  return serverContent.modelTurn && serverContent.modelTurn.parts;
}

// ✅ Create a single instance for use in the app
const geminiClient = new GeminiLiveClient();
export default geminiClient;