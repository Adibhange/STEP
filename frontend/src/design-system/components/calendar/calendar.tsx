'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { Icon } from '../../icon';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className = '',
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`p-md bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] text-[var(--text-primary)] ${className}`}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-between pt-1 relative items-center px-xs',
        caption_label: 'text-[length:var(--type-body-md-size)] font-semibold text-[var(--text-primary)]',
        nav: 'space-x-1 flex items-center',
        button_previous: 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] focus-ring-step absolute left-1',
        button_next: 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] focus-ring-step absolute right-1',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-[var(--text-tertiary)] rounded-md w-9 font-medium text-[11px] uppercase tracking-wider text-center',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day_button: 'h-9 w-9 p-0 font-normal rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center justify-center text-[length:var(--type-body-md-size)] transition-colors focus-ring-step',
        selected: 'bg-[var(--accent-indigo)] !text-white hover:bg-[var(--accent-indigo-hover)] hover:!text-white focus:bg-[var(--accent-indigo)] focus:!text-white font-semibold',
        today: 'bg-[var(--surface-hover)] text-[var(--accent-indigo)] font-bold border border-[var(--accent-indigo)]/30',
        outside: 'text-[var(--text-tertiary)] opacity-30',
        disabled: 'text-[var(--text-disabled)] opacity-30 pointer-events-none',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          <Icon
            name={orientation === 'left' ? 'chevron-left' : 'chevron-right'}
            size="xs"
          />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
