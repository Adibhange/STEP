import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ className, onChange, ...props }) => {
  return (
    <div className="relative w-full">
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        className={cn(
          'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2563EB]',
          className
        )}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};
