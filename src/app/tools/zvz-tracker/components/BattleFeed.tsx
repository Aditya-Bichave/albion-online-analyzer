'use client';

import { BattleEvent } from '../types';
import { Pagination } from '@/components/ui/Pagination';

interface Props {
  events: BattleEvent[];
  currentPage: number;
  onPageChange: (page: number) => void;
  t: (key: string) => string;
  totalEvents?: number;
  itemsPerPage?: number;
}

export default function BattleFeed({
  events,
  currentPage,
  onPageChange,
  t,
  totalEvents = 0,
  itemsPerPage = 50
}: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t('noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase text-left">{t('time')}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-left">{t('killer')}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-left">{t('victim')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {events.map((event, idx) => (
              <EventRow key={event.eventId || idx} event={event} t={t} />
            ))}
          </tbody>
        </table>
      </div>

      {totalEvents > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalEvents / itemsPerPage)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function EventRow({ event, t }: { event: BattleEvent; t: (key: string) => string }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatTimeAgo(event.timestamp, t)}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-success group-hover:text-success/80 transition-colors">
            {event.killer.name}
          </span>
          {event.killer.guildName && (
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {event.killer.guildName}
            </span>
          )}
          {event.killStreak && event.killStreak > 2 && (
            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded font-bold animate-pulse-slow">
              🔥 {event.killStreak} streak
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-destructive group-hover:text-destructive/80 transition-colors">
            {event.victim.name}
          </span>
          {event.victim.guildName && (
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {event.victim.guildName}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function formatTimeAgo(dateString: string, t: (key: string, params?: any) => string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return t('invalidDate') || 'Invalid date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t('secondsAgo', { n: diffInSeconds });
  }
  if (diffInSeconds < 3600) {
    const m = Math.floor(diffInSeconds / 60);
    return m === 1 ? t('minuteAgo') : t('minutesAgo', { n: m });
  }
  const h = Math.floor(diffInSeconds / 3600);
  return h === 1 ? t('hourAgo') : t('hoursAgo', { n: h });
}
