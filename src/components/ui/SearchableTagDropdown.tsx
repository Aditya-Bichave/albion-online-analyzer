'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SearchableTagDropdownProps {
  label?: string;
  tags: { key: string; label: string }[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function SearchableTagDropdown({
  label,
  tags,
  selectedTags,
  onChange,
  placeholder,
  className = '',
  maxTags = 10
}: SearchableTagDropdownProps) {
  const t = useTranslations('Common');
  const tCreate = useTranslations('CreateBuild');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayPlaceholder = placeholder || tCreate('selectTagsPlaceholder');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredTags = tags.filter(tag =>
    tag.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTag = (key: string) => {
    if (selectedTags.includes(key)) {
      onChange(selectedTags.filter(t => t !== key));
    } else {
      if (selectedTags.length >= maxTags) {
        return; // Don't add more tags if limit reached
      }
      onChange([...selectedTags, key]);
    }
  };

  const removeTag = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTags.filter(t => t !== key));
  };

  const selectedLabels = tags
    .filter(tag => selectedTags.includes(tag.key))
    .map(tag => tag.label);

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}

      {/* Selected Tags Display - Outside the dropdown button */}
      {selectedTags.length > 0 && (
        <div className="flex items-center flex-wrap gap-1 mb-2">
          {selectedTags.map(key => {
            const tag = tags.find(t => t.key === key);
            return tag ? (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium border border-primary/20"
              >
                {tag.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(key, e);
                  }}
                  className="hover:text-primary-foreground transition-colors rounded-full p-0.5 hover:bg-primary/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      <div className="relative">
        {/* Dropdown Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-background border border-input rounded-lg px-3 py-2 text-left flex items-center justify-between gap-2 focus:border-primary outline-none transition-colors min-h-[42px]`}
        >
          <span className={`text-muted-foreground ${selectedTags.length > 0 ? 'text-sm' : ''}`}>
            {selectedTags.length > 0 ? `${selectedTags.length} tag(s) selected` : displayPlaceholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[200px] overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder={t('search')}
                  className="w-full bg-background border border-input rounded-md py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Scrollable Tag List */}
            <div className="overflow-y-auto flex-1 p-1">
              {filteredTags.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  {t('noItemsFound')}
                </div>
              ) : (
                <>
                  {selectedTags.length >= maxTags && (
                    <div className="px-3 py-2 text-xs text-amber-500 bg-amber-500/10 border-b border-border">
                      ⚠️ Maximum {maxTags} tags reached. Remove a tag to add more.
                    </div>
                  )}
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.key}
                      type="button"
                      onClick={() => toggleTag(tag.key)}
                      disabled={selectedTags.length >= maxTags && !selectedTags.includes(tag.key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors
                        ${selectedTags.includes(tag.key)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                        ${selectedTags.length >= maxTags && !selectedTags.includes(tag.key) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span>{tag.label}</span>
                      {selectedTags.includes(tag.key) && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
