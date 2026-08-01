'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Calendar } from '../calendar';
import { Button } from '../button';
import { Icon } from '../../icon';

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  placeholder = 'Select date...',
  className = '',
  disabled = false,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  const handleSelect = (newDate?: Date) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`w-full justify-start text-left font-normal ${
            !selectedDate ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'
          } ${className}`}
        >
          <Icon name="calendar" size="xs" className="mr-xs opacity-70" />
          {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
};
