'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Icon } from '../../icon';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className = '', ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={`border-b border-[var(--border-default)] ${className}`}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={`flex flex-1 items-center justify-between py-md text-[length:var(--type-body-lg-size)] font-semibold text-[var(--text-primary)] transition-all hover:text-[var(--accent-indigo)] focus-ring-step [&[data-state=open]>svg]:rotate-180 ${className}`}
      {...props}
    >
      {children}
      <Icon
        name="chevron-down"
        size="xs"
        className="shrink-0 text-[var(--text-tertiary)] transition-transform duration-fast"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className = '', children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={`overflow-hidden text-[length:var(--type-body-md-size)] text-[var(--text-secondary)] transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down ${className}`}
    {...props}
  >
    <div className="pb-md pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
