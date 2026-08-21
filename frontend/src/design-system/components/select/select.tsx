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
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  menuPlacement?: 'bottom' | 'top' | 'auto';
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
  className = '',
  size = 'md',
  disabled = false,
  children,
}) => {
  // If children are provided, render as Radix primitive Root wrapper
  if (children && options.length === 0) {
    return <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>{children}</SelectPrimitive.Root>;
  }

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const sizeStyles = {
    sm: 'h-8 px-2.5 rounded-lg text-[11.5px]',
    md: 'h-10 px-3.5 rounded-xl text-xs',
    lg: 'h-11 px-4 rounded-xl text-sm',
  }[size];

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(val) => {
        onChange?.(val);
        setSearch('');
      }}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className={`${sizeStyles} border flex items-center justify-between gap-1.5 ${widthClass} transition-all duration-150 ease-out cursor-pointer select-none focus-ring-step outline-none ${
          value
            ? 'bg-[var(--surface-2)] border-[var(--accent-indigo)]/50 text-[var(--text-primary)] font-semibold shadow-2xs'
            : 'bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium shadow-2xs'
        } ${open ? 'border-[var(--accent-indigo)] ring-2 ring-[var(--accent-indigo)]/20' : ''} ${className}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <SelectPrimitive.Icon asChild>
          <Icon
            name="chevron-down"
            size="xs"
            className={`shrink-0 transition-transform duration-150 ${
              value ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'
            } ${open ? 'rotate-180 text-[var(--accent-indigo)]' : ''}`}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={5}
          className="z-[9999] w-[var(--radix-select-trigger-width)] max-h-52 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-xl)] p-1.5"
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
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <SelectPrimitive.Viewport className="max-h-36 overflow-y-auto scrollbar-none space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-[11.5px] text-[var(--text-tertiary)] text-center font-sans">No options found</div>
            ) : (
              filteredOptions.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-md)] text-[12px] text-left transition-colors duration-150 cursor-pointer font-sans outline-none data-[highlighted]:bg-[var(--surface-hover)] data-[highlighted]:text-[var(--text-primary)] data-[state=checked]:bg-[var(--accent-indigo-dim)] data-[state=checked]:text-[var(--accent-indigo)] data-[state=checked]:font-bold"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Icon name="check" size="xs" className="text-[var(--accent-indigo)] shrink-0 ml-2" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
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
