'use client';

import { useState } from 'react';
import { Search, X, Shield, Crown, Users } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SearchResult {
  id: string;
  type: 'guilds' | 'players' | 'alliances';
  Name?: string;
  name?: string;
  Tag?: string;
}

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[] | null;
  onEntityClick: (type: string, id: string) => void;
  isSearching: boolean;
  t: (key: string) => string;
  selectedEntity?: any | null;
  onCloseEntityProfile?: () => void;
  region?: string;
}

export default function SearchSection({
  searchQuery,
  onSearchChange,
  searchResults,
  onEntityClick,
  isSearching,
  t,
  selectedEntity,
  onCloseEntityProfile,
  region
}: Props) {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pr-10"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && searchResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.map((result: SearchResult) => (
            <SearchResultItem
              key={result.id}
              result={result}
              onClick={() => onEntityClick(result.type, result.id)}
              t={t}
            />
          ))}
        </div>
      )}

      {isSearching && searchResults === null && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="bg-card border border-border rounded-xl p-4 text-center text-muted-foreground">
            {t('searching')}...
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResultItem({ result, onClick, t }: { result: SearchResult; onClick: () => void; t: (key: string) => string }) {
  const icon = result.type === 'guilds' ? <Shield /> : result.type === 'alliances' ? <Crown /> : <Users />;
  const color = result.type === 'guilds' ? 'text-success' : result.type === 'alliances' ? 'text-primary' : 'text-warning';

  return (
    <button
      onClick={onClick}
      className="w-full p-3 hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
    >
      <div className={`p-2 rounded-lg bg-muted/20 ${color}`}>
        {icon}
      </div>
      <div className="text-left">
        <div className="font-bold text-foreground">
          {result.Name || result.name}
          {result.Tag && <span className="text-muted-foreground ml-2">[{result.Tag}]</span>}
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          {t(result.type.slice(0, -1))} {/* Remove 's' from type */}
        </div>
      </div>
    </button>
  );
}
