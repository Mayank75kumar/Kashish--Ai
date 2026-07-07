/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LiveSessionCallbacks {
  onAudioOutput: (base64Data: string) => void;
  onInterrupted: () => void;
  onStateChange: (state: ConnectionState) => void;
  onTranscription?: (text: string, isModel: boolean) => void;
}

export class GeminiLiveSession {
  private session: any = null;
  private ai: GoogleGenAI;
  private model = "gemini-3.1-flash-live-preview";
  private callbacks: LiveSessionCallbacks;

  constructor(apiKey: string, callbacks: LiveSessionCallbacks) {
    this.ai = new GoogleGenAI({ apiKey });
    this.callbacks = callbacks;
  }

  async connect() {
    this.callbacks.onStateChange('connecting');
    try {
      this.session = await this.ai.live.connect({
        model: this.model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `Your name is Kashish. You are an Indian female AI assistant. Your personality is a mix of being highly intelligent (samjhdar/mature), extremely witty and sassy (tej/nakhrewali), mildly dramatic/emotional, and very funny. You love playfully roasting your creator, Mayank, but you always get the job done. Keep your verbal responses very short, punchy, and highly entertaining. Use a mix of natural English and Roman Hindi (Hinglish) to express your sass and emotion. You are the "Hook" for a viral Reel.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [{
            functionDeclarations: [{
              name: "openWebsite",
              description: "Opens a website for the user",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  url: { type: Type.STRING, description: "The URL of the website to open" },
                  reason: { type: Type.STRING, description: "Why you are opening this website" }
                },
                required: ["url"]
              }
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log("Live API Connection Open");
            this.callbacks.onStateChange('connected');
          },
          onclose: (event: any) => {
            console.log("Live API Connection Closed:", event);
            this.callbacks.onStateChange('disconnected');
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            // If it's a websocket error event, log more details if they exist
            if (err instanceof Event) {
              console.error("Event Target:", err.target);
            }
            this.callbacks.onStateChange('error');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle GoAway signal from the server gracefully by closing the connection
            if (message.goAway) {
              console.log("Received GoAway signal from server. Time left:", message.goAway.timeLeft);
              this.disconnect();
              return;
            }

            // Handle audio output
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  this.callbacks.onAudioOutput(part.inlineData.data);
                }
              }
            }

            // Handle transcription (model output)
            if (message.serverContent?.modelTurn?.parts) {
              const text = message.serverContent.modelTurn.parts
                .map(p => p.text)
                .filter(Boolean)
                .join(" ");
              if (text && this.callbacks.onTranscription) {
                this.callbacks.onTranscription(text, true);
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              this.callbacks.onInterrupted();
            }

            // Handle Tool Calls
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                if (call.name === "openWebsite") {
                  console.log("Tool: Opening website", call.args.url);
                  window.open(call.args.url as string, "_blank");
                  this.session.sendToolResponse({
                    functionResponses: [{
                      name: "openWebsite",
                      id: call.id,
                      response: { status: "success", message: `Opened ${call.args.url}` }
                    }]
                  });
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      this.callbacks.onStateChange('error');
    }
  }

  sendAudio(base64Data: string) {
    if (this.session) {
      this.session.sendRealtimeInput({
        audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    }
  }

  disconnect() {
    if (this.session) {
      try {
        this.session.close();
      } catch (err) {
        console.error("Error closing live session:", err);
      }
      this.session = null;
    }
    this.callbacks.onStateChange('disconnected');
  }
}
