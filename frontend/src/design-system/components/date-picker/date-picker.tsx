'use client';

import React from 'react';
import { CustomCalendarPicker, type CustomCalendarPickerProps } from '../custom-calendar-picker/CustomCalendarPicker';

export type DatePickerProps = CustomCalendarPickerProps & {
  date?: Date;
  onDateChange?: (date?: Date) => void;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  value,
  onChange,
  ...props
}) => {
  const computedValue = value ?? (date ? date.toISOString().split('T')[0] : '');

  const handleChange = (newVal: string) => {
    onChange?.(newVal);
    if (onDateChange) {
      if (newVal && /^\d{4}-\d{2}-\d{2}$/.test(newVal)) {
        const [y, m, d] = newVal.split('-').map(Number);
        onDateChange(new Date(y, m - 1, d));
      } else {
        onDateChange(undefined);
      }
    }
  };

  return (
    <CustomCalendarPicker
      value={computedValue}
      onChange={handleChange}
      {...props}
    />
  );
};
