'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Start progress when route changes
    setProgress(0);
    setShow(true);

    // Animate progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return prev; // Stop at 90% until route change completes
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [pathname]);

  useEffect(() => {
    // Complete progress when route change is done
    if (progress >= 90) {
      setProgress(100);
      const timeout = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
