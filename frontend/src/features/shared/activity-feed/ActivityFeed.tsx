'use client';

import React from 'react';
import { Icon } from '@/design-system';

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Activity Audit Trail',
}) => {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 shadow-2xs">
      <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
        {title}
      </h3>
      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex gap-3 pb-3 border-b border-[var(--border-soft)] last:border-none">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
              <Icon name={(act.icon || 'list') as any} size="xs" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[13px] font-bold text-[var(--text-primary)] truncate">{act.title}</h4>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] shrink-0">{act.timestamp}</span>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-snug">{act.description}</p>
              <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] mt-1 block">By {act.user}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
