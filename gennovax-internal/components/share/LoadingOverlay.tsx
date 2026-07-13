"use client";

import React, { useEffect, useRef, useState } from "react";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

const MIN_LOADING_MS = 300;

export default function LoadingOverlay({
  isLoading,
  text = "Dang xu ly...",
}: LoadingOverlayProps) {
  const [visible, setVisible] = useState(isLoading);
  const startedAtRef = useRef<number | null>(isLoading ? Date.now() : null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (isLoading) {
      startedAtRef.current = Date.now();
      setVisible(true);
      return;
    }

    if (!visible) return;

    const startedAt = startedAtRef.current;
    if (!startedAt) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      startedAtRef.current = null;
      hideTimerRef.current = null;
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-[2px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center">
        <div className="relative h-16 w-16 animate-[spin_1.8s_linear_infinite]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 flex justify-center"
              style={{
                transform: `rotate(${i * 45}deg)`,
              }}
            >
              <div
                className="mt-0.5 h-3.5 w-3.5 rounded-full bg-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                style={{
                  opacity: 1 - i * 0.1,
                  backgroundColor: `rgba(56, 189, 248, ${1 - i * 0.08})`,
                }}
              />
            </div>
          ))}
        </div>

        {/* <p className="text-gray-700 font-medium animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          {text}
        </p> */}
      </div>
    </div>
  );
}
