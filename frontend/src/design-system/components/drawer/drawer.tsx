'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className = '', ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={`fixed inset-0 z-[var(--z-drawer)] bg-[var(--overlay)] backdrop-blur-[var(--blur-sm)] ${className}`}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className = '', children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={`fixed inset-x-0 bottom-0 z-[var(--z-drawer)] mt-24 flex h-auto flex-col rounded-t-[var(--radius-xl)] border-t border-[var(--border-default)] bg-[var(--surface-1)] shadow-[var(--shadow-xl)] ${className}`}
      {...props}
    >
      <div className="mx-auto mt-sm h-1.5 w-[40px] rounded-full bg-[var(--border-strong)]" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`grid gap-3xs p-lg text-center sm:text-left ${className}`} {...props} />
);

const DrawerFooter = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-auto flex flex-col gap-xs p-lg ${className}`} {...props} />
);

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className = '', ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={`text-[length:var(--type-h2-size)] font-semibold leading-tight text-[var(--text-primary)] ${className}`}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className = '', ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={`text-[length:var(--type-body-md-size)] text-[var(--text-secondary)] ${className}`}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
