/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Mic, Zap, Sparkles, Command } from "lucide-react";
import { ConnectionState } from "../services/gemini-live";

interface KashishUIProps {
  state: ConnectionState;
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
  onTogglePower: () => void;
}

export function KashishUI({ state, isListening, isSpeaking, volume, onTogglePower }: KashishUIProps) {
  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting';

  return (
    <div className="relative min-h-screen w-full bg-[#020202] flex flex-col items-center justify-center overflow-hidden font-sans text-white">
      {/* Cinematic Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/30 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-900/20 rounded-full blur-[160px]" />
      </div>

      {/* Glassmorphic Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-4 z-50 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-indigo-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-[10px] font-mono tracking-[0.2em] text-white/60 uppercase">
            KASHISH . {state.toUpperCase()}
          </span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
          LIVE // HINGLISH
        </span>
      </motion.div>

      {/* Main Visualizer Area */}
      <div className="relative z-10 flex flex-col items-center gap-16 select-none">
        <div className="relative group" onClick={onTogglePower}>
          {/* Ambient Glows */}
          <AnimatePresence>
            {isConnected && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.1, 0.25, 0.1],
                    scale: [1, 1.3, 1] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-indigo-500/10 rounded-full blur-[80px]"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.05, 0.15, 0.05],
                    scale: [1.2, 0.9, 1.2] 
                  }}
                  transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                  className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[400%] bg-fuchsia-500/5 rounded-full blur-[100px]"
                />
              </>
            )}
          </AnimatePresence>

          {/* Central Orb Visualizer */}
          <motion.div
            animate={{
              boxShadow: isConnected 
                ? [
                    `0 0 40px -10px rgba(99, 102, 241, 0.5)`,
                    `0 0 80px 0px rgba(168, 85, 247, 0.6)`,
                    `0 0 40px -10px rgba(99, 102, 241, 0.5)`
                  ]
                : "0 0 0px 0px rgba(255,255,255,0)"
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="p-1 rounded-full bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-1000 ${
                isConnected 
                  ? 'bg-black/40 border border-white/20' 
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              {/* Dynamic Aura */}
              {isConnected && (
                <motion.div
                  animate={{ 
                    scale: 1 + (volume * 1.5),
                    background: isSpeaking 
                      ? "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)"
                  }}
                  className="absolute inset-0 rounded-full"
                />
              )}

              {/* Core Icon */}
              <div className="relative z-20 flex flex-col items-center gap-2">
                <AnimatePresence mode="wait">
                  {isConnected ? (
                    <motion.div
                      key="live"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                    >
                      <Mic className={`w-12 h-12 transition-colors duration-500 ${isSpeaking ? 'text-indigo-300' : 'text-white'}`} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                        <Zap className="w-8 h-8 text-white/40" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Orbital Rings */}
              {isConnected && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border border-white/5 rounded-full border-t-indigo-500/30"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 border border-white/5 rounded-full border-b-fuchsia-500/20"
                  />
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Cinematic Title & Description */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <motion.h1 
              animate={{ 
                opacity: isConnecting ? [0.4, 1, 0.4] : 1,
                letterSpacing: isConnected ? "0.4em" : "0.2em"
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="text-5xl font-extrabold tracking-[0.4em] uppercase text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {isConnecting ? 'WAKING...' : isConnected ? 'KASHISH LIVE' : 'WAKE KASHISH'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-xs font-mono tracking-[0.4em] uppercase"
            >
              The Next Evolution of Sassy AI
            </motion.p>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              className="h-6 flex items-center justify-center gap-3"
            >
              {isConnected ? (
                <>
                  <p className="text-indigo-400/80 text-sm font-medium tracking-wide">
                    {isSpeaking ? "KASHISH IS ROASTING YOU..." : isListening ? "LISTENING TO YOUR DRAMA..." : "WAITING FOR A COMMAND..."}
                  </p>
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                </>
              ) : (
                <p className="text-white/20 text-[10px] uppercase tracking-widest">
                  Click the core to summon Mayank's creation
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer System Specs */}
      <div className="fixed bottom-10 left-10 right-10 flex items-end justify-between z-10">
        <div className="space-y-1">
          <div className="flex gap-2 items-center opacity-40">
            <Command className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Protocol Version</span>
          </div>
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.3em]">
            PCM16 . 16kHz . LOW_LATENCY . {isConnected ? 'SECURE' : 'IDLE'}
          </p>
        </div>

        <div className="flex gap-6 items-center opacity-20 hover:opacity-40 transition-opacity duration-500">
          <div className="text-right">
            <p className="text-[8px] font-mono uppercase tracking-widest">Creator</p>
            <p className="text-[10px] font-bold tracking-tighter uppercase">Mayank</p>
          </div>
        </div>
      </div>

      {/* Interruption Indicator (Slight Toast) */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-32 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-[9px] uppercase tracking-[0.3em] text-white/30"
          >
            Interrupt me if you dare, samjhe?
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
