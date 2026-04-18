/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, Landmark, Quote, ChevronUp, MapPin, Heart, Download } from 'lucide-react';
import { cn } from './lib/utils';
import { sceneryService } from './services/sceneryService';
import { Scenery, AppState } from './types';

// Helper for play audio
const playCreak = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2855/2855-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {}); // Catch autoplay block
};

export default function App() {
  const [state, setState] = useState<AppState>('closed');
  const [currentScenery, setCurrentScenery] = useState<Scenery | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchNextScenery = useCallback(async () => {
    setIsLoading(true);
    const scene = await sceneryService.getRandomScenery();
    setCurrentScenery(scene);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNextScenery();
  }, [fetchNextScenery]);

  const handleOpen = () => {
    if (state !== 'closed' || isLoading) return;
    
    playCreak();
    setState('opening');
    
    setTimeout(() => {
      setState('opened');
    }, 1000); // Faster open
  };

  const handleRestart = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsDownloading(false);
    
    // Portal transition effect - Snappier
    setTimeout(async () => {
      await fetchNextScenery();
      setIsTransitioning(false);
    }, 400); // Reduced from 600
  };

  const handleDownload = async () => {
    if (!currentScenery || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(currentScenery.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentScenery.name}_${currentScenery.country}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
      // Fallback: opens in a new tab if blob download fails
      window.open(currentScenery.imageUrl, '_blank');
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[radial-gradient(circle_at_center,_var(--color-immersive-indigo)_0%,_var(--color-immersive-bg)_100%)] overflow-hidden font-sans text-white">
      {/* Portal Transition Flash - Snappier */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="absolute inset-0 z-[100] bg-white pointer-events-none"
            style={{ borderRadius: '50%' }}
          />
        )}
      </AnimatePresence>

      {/* Badge Decoration */}
      <div className="absolute top-8 left-8 z-50 text-[9px] tracking-[4px] uppercase opacity-30 font-medium pointer-events-none">
        Doraemon <span className="mx-2">•</span> Anywhere Door
      </div>

      {/* Background Layer (The Destination) */}
      <AnimatePresence mode="wait">
        {state !== 'closed' && currentScenery && (
          <motion.div
            key={currentScenery.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 flex"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
               <div className="absolute inset-0 bg-black/40 z-10" />
               <motion.img
                  key={`img-${currentScenery.id}`}
                  initial={{ scale: 1.1, x: '-2%', y: '-2%' }}
                  animate={{ scale: 1, x: '0%', y: '0%' }}
                  transition={{ duration: 8, ease: "linear" }}
                  src={currentScenery.imageUrl}
                  alt={currentScenery.name}
                  referrerPolicy="no-referrer"
                  className="h-[105%] w-[105%] object-cover max-w-none"
               />
            </div>
            
            {/* Scenery Content Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative z-20 flex flex-col justify-end pb-40 px-10 md:px-24 w-full md:w-[70%]"
            >
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-col gap-1">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                    {currentScenery.name}
                  </h1>
                  <div className="flex flex-col">
                    <p className="text-lg md:text-xl opacity-70 font-light tracking-wide uppercase">
                      {currentScenery.country}
                    </p>
                    <span className="text-xs font-mono text-white/50 tracking-wider mt-1">
                      {Math.abs(currentScenery.lat).toFixed(4)}{currentScenery.lat >= 0 ? 'N' : 'S'}, {Math.abs(currentScenery.lng).toFixed(4)}{currentScenery.lng >= 0 ? 'E' : 'W'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-16 left-10 right-10 md:left-auto md:right-24 z-20 flex flex-row gap-4 justify-between md:justify-end"
            >
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                  "flex-1 md:flex-none px-6 py-3 rounded-full backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-[2px] uppercase transition-all duration-300 flex items-center justify-center gap-2",
                  isDownloading 
                    ? "bg-green-500 text-white border-green-500" 
                    : "bg-black/40 text-white hover:bg-black/60"
                )}
              >
                <Download className="w-3 h-3" />
                {isDownloading ? "Downloading..." : "Download"}
              </button>
              <button
                onClick={handleRestart}
                disabled={isTransitioning}
                className="flex-[1.5] md:flex-none px-6 py-3 rounded-full bg-white text-black border-none text-[10px] font-bold tracking-[2px] uppercase hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2 group"
              >
                <RefreshCw className={cn("w-3 h-3 rotate-0 group-hover:rotate-180 transition-transform duration-500", isTransitioning && "animate-spin")} />
                Next World
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Door Layer (Dokodemo Door) */}
      <div className={cn(
        "absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-1000",
        state === 'opened' ? "opacity-0 invisible scale-110" : "opacity-100 visible scale-100"
      )}>
        <div className="relative w-full max-w-md aspect-[3/5] pointer-events-auto flex flex-col items-center">
          
          {/* Instruction Text */}
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: state === 'closed' ? 1 : 0 }}
            className="absolute -top-32 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-[6px] uppercase mb-3">
              推开门
            </h2>
            <p className="text-white/60 tracking-[2px] text-sm">去世界的另一边</p>
          </motion.div>

          {/* Swipe Up Hint */}
          <AnimatePresence>
            {state === 'closed' && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 0.5, y: -20 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                className="absolute -top-12 z-50 cursor-pointer"
                onClick={handleOpen}
              >
                <ChevronUp className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Door Frame */}
          <div className="relative w-[340px] h-[560px] bg-immersive-door border-[12px] border-immersive-door-shadow shadow-[0_0_50px_rgba(255,105,180,0.3)] rounded-sm overflow-hidden flex items-stretch">
            {/* Left Door Panel */}
            <motion.div
              drag="y"
              dragConstraints={{ top: -100, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y < -50) handleOpen();
              }}
              initial={false}
              animate={state !== 'closed' ? { rotateY: -110 } : { rotateY: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
              className="w-full h-full bg-immersive-door border-l-4 border-white/20 relative z-10 flex flex-col items-center justify-center cursor-pointer"
              onClick={handleOpen}
            >
              {/* Door Panel Detail (Inscribed rectangle) */}
              <div className="w-[85%] h-[90%] border-2 border-white/10 rounded-sm">
                 {/* Door Knob - Gold */}
                 <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#fff_0%,_var(--color-immersive-gold)_100%)] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black/10" />
                 </div>
              </div>
            </motion.div>
            
            {/* The "Inside" Glowing View */}
            <div className="absolute inset-0 bg-immersive-bg flex items-center justify-center">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#2d1b4d_0%,_var(--color-immersive-bg)_100%)] flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <RefreshCw className="w-24 h-24 text-white/5 animate-spin-slow" />
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Subtle Base */}
          <div className="w-[420px] h-2 bg-immersive-door-shadow/30 rounded-full mt-4 blur-sm" />
        </div>
      </div>

      {/* Loading Bar */}
      {isLoading && state === 'closed' && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-immersive-gold animate-loading-bar z-50" />
      )}
    </div>
  );
}
