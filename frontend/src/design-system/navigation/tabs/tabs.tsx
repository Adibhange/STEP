'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { TabsProps as LegacyTabsProps } from './tabs.types';

const TabsRoot = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-3)] p-3xs border border-[var(--border-default)] text-[var(--text-secondary)] ${className}`}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] px-sm py-2xs text-[length:var(--type-body-md-size)] font-medium transition-all focus-ring-step cursor-pointer disabled:pointer-events-none disabled:opacity-[var(--opacity-disabled)] data-[state=active]:bg-[var(--surface-1)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:font-semibold data-[state=active]:shadow-sm ${className}`}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-xs focus-ring-step ${className}`}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export interface ExtendedTabsProps extends Partial<LegacyTabsProps> {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, ExtendedTabsProps>(
  ({ items, activeId, onChange, ariaLabel, className = '', children, value, defaultValue, onValueChange, ...props }, ref) => {
    // Backwards-compatible mode when `items` prop is passed
    if (items && activeId && onChange) {
      return (
        <TabsRoot value={activeId} onValueChange={onChange} className={className}>
          <TabsList aria-label={ariaLabel} className="w-full">
            {items.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                className="flex-1 gap-xs"
              >
                {item.icon}
                <span>{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </TabsRoot>
      );
    }

    // Compound component mode
    return (
      <TabsRoot
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        className={className}
        {...props}
      >
        {children}
      </TabsRoot>
    );
  }
);
Tabs.displayName = 'Tabs';

export { TabsRoot, TabsList, TabsTrigger, TabsContent };
