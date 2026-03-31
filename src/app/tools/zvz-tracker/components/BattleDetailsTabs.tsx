'use client';

import { useState, useRef, useEffect } from 'react';
import '../styles/premium-animations.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  t: (key: string) => string;
}

export default function BattleDetailsTabs({ tabs, activeTab, onTabChange, t }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative mb-6">
      {/* Scroll Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Tabs */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab, idx) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            delay={idx * 50}
          />
        ))}
      </div>
    </div>
  );
}

interface TabButtonProps {
  tab: Tab;
  active: boolean;
  onClick: () => void;
  delay?: number;
}

function TabButton({ tab, active, onClick, delay = 0 }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl
        font-bold text-sm whitespace-nowrap
        transition-all duration-300
        animate-fade-in-up
        hover:scale-105
        ${
          active
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
            : 'bg-card/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
        }
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
      <span>{tab.label}</span>
      {tab.count !== undefined && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-black
          ${active ? 'bg-primary-foreground/20' : 'bg-muted'}
        `}>
          {tab.count}
        </span>
      )}
    </button>
  );
}
