'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Icon } from '../../icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options?: SelectOption[];
  onChange?: (val: string) => void;
  widthClass?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * STEP Enterprise Design System Select Component
 *
 * Universal tokenized dropdown component with pill-style trigger, active indigo styling,
 * Framer Motion entrance animation, search filter for >4 options, and checkmark indicators.
 */
export const Select: React.FC<SelectProps> & {
  Group: typeof SelectGroup;
  Value: typeof SelectValue;
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  Label: typeof SelectLabel;
  Item: typeof SelectItem;
  Separator: typeof SelectSeparator;
} = ({
  label = 'Select',
  placeholder = 'Select option...',
  value = '',
  options = [],
  onChange,
  widthClass = 'w-auto',
  disabled = false,
  children,
}) => {
  // If children are provided, render as Radix primitive Root wrapper
  if (children && options.length === 0) {
    return <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>{children}</SelectPrimitive.Root>;
  }

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  const filteredOptions = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className={`relative inline-block shrink-0 ${open ? 'z-[100]' : 'z-10'} ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        className={`h-8.5 px-3.5 rounded-full border flex items-center justify-between gap-2 ${widthClass}
          text-[12px] transition-all duration-150 ease-out cursor-pointer select-none focus-ring-step active:scale-[0.98]
          ${value
            ? 'bg-[var(--accent-indigo-dim)] border-[var(--border-focus)] text-[var(--accent-indigo)] font-bold'
            : 'bg-[var(--surface-1)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-semibold'
          }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
          name="chevron-down"
          size="xs"
          className={`shrink-0 transition-transform duration-150 ${
            value ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'
          } ${open ? 'rotate-180 text-[var(--accent-indigo)]' : ''}`}
        />
      </button>

      {/* Dropdown Panel with Motion */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 min-w-[180px] max-w-[280px] w-full bg-[var(--surface-1)] border border-[var(--border-default)]
              rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[100] p-1.5 overflow-hidden origin-top-left"
            role="listbox"
          >
            {options.length > 4 && (
              <div className="px-1 py-1 mb-1 border-b border-[var(--border-soft)]">
                <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-default)] focus-within:border-[var(--border-focus)] transition-all duration-150">
                  <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] font-sans"
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto scrollbar-step space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-[11.5px] text-[var(--text-tertiary)] text-center font-sans">No options found</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange?.(opt.value);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-md)] text-[12px] text-left transition-colors duration-150 cursor-pointer font-sans
                        ${isSelected
                          ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium'
                        }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Icon name="check" size="xs" className="text-[var(--accent-indigo)] shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`flex h-8.5 px-3.5 items-center justify-between rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-ring-step disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)] [&>span]:line-clamp-1 ${className}`}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon name="chevron-down" size="xs" className="opacity-60 shrink-0 ml-2" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={`flex cursor-default items-center justify-center py-1 ${className}`}
    {...props}
  >
    <Icon name="chevron-up" size="xs" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={`flex cursor-default items-center justify-center py-1 ${className}`}
    {...props}
  >
    <Icon name="chevron-down" size="xs" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className = '', children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`relative z-[var(--z-dropdown)] max-h-96 min-w-[8rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-lg)] data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out ${
        position === 'popper'
          ? 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'
          : ''
      } ${className}`}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={`p-1.5 ${
          position === 'popper'
            ? 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            : ''
        }`}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`py-1 px-3 text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] ${className}`}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-[var(--radius-md)] py-1.5 pl-7 pr-3 text-[12px] font-medium outline-none focus:bg-[var(--surface-hover)] focus:text-[var(--text-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Icon name="check" size="xs" className="text-[var(--accent-indigo)]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`-mx-1 my-1 h-px bg-[var(--border-default)] ${className}`}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

Select.Group = SelectGroup;
Select.Value = SelectValue;
Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Label = SelectLabel;
Select.Item = SelectItem;
Select.Separator = SelectSeparator;

export {
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
