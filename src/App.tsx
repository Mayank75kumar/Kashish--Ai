/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioStreamer } from './lib/audio-streamer';
import { GeminiLiveSession, ConnectionState } from './services/gemini-live';
import { KashishUI } from './components/KashishUI';

const API_KEY = process.env.GEMINI_API_KEY || '';

export default function App() {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);

  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const streamerRef = useRef<AudioStreamer | null>(null);

  // Initialize Audio Streamer once
  useEffect(() => {
    const streamer = new AudioStreamer(
      (base64) => {
        if (sessionRef.current) {
          sessionRef.current.sendAudio(base64);
        }
      },
      (vol) => {
        setVolume(vol);
      }
    );
    streamerRef.current = streamer;

    return () => {
      streamer.stop();
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, []);

  const handleTogglePower = useCallback(async () => {
    if (state === 'connected' || state === 'connecting') {
      sessionRef.current?.disconnect();
      streamerRef.current?.stop();
      setIsListening(false);
      setIsSpeaking(false);
    } else {
      if (!API_KEY) {
        console.error("No API key found. Please add GEMINI_API_KEY to your secrets.");
        setState('error');
        return;
      }

      const session = new GeminiLiveSession(API_KEY, {
        onStateChange: (newState) => setState(newState),
        onAudioOutput: (base64) => {
          setIsSpeaking(true);
          streamerRef.current?.playAudio(base64);
        },
        onInterrupted: () => {
          streamerRef.current?.clearQueue();
          setIsSpeaking(false);
        },
        onTranscription: (text, isModel) => {
          console.log(`${isModel ? 'Kashish' : 'You'}: ${text}`);
        }
      });

      sessionRef.current = session;
      
      try {
        await streamerRef.current?.start();
        await session.connect();
        setIsListening(true);
      } catch (err) {
        console.error("Activation failed:", err);
        setState('error');
      }
    }
  }, [state]);

  // Reset audio streamer and listening states when disconnected or errored
  useEffect(() => {
    if (state === 'disconnected' || state === 'error') {
      streamerRef.current?.stop();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [state]);

  // Handle auto-resetting isSpeaking based on volume or timer 
  useEffect(() => {
    if (isSpeaking) {
      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, volume]);

  return (
    <KashishUI 
      state={state}
      isListening={isListening}
      isSpeaking={isSpeaking}
      volume={volume}
      onTogglePower={handleTogglePower}
    />
  );
}
