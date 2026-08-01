'use client';

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { Icon } from '../../icon';

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className = '', children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={`relative z-[var(--z-header)] flex max-w-max flex-1 items-center justify-center ${className}`}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className = '', ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={`group flex flex-1 list-none items-center justify-center space-x-1 ${className}`}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={`group inline-flex h-[var(--button-height-md)] w-max items-center justify-center rounded-[var(--radius-md)] bg-transparent px-sm py-2xs text-[length:var(--type-body-md-size)] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-ring-step disabled:pointer-events-none disabled:opacity-[var(--opacity-disabled)] data-[active]:bg-[var(--surface-hover)] data-[state=open]:bg-[var(--surface-hover)] ${className}`}
    {...props}
  >
    {children}{' '}
    <Icon
      name="chevron-down"
      size="xs"
      className="relative top-[1px] ml-2xs transition duration-fast group-data-[state=open]:rotate-180"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className = '', ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={`left-0 top-0 w-full data-[motion^=from-]:animate-fade-in data-[motion^=to-]:animate-fade-out md:absolute md:w-auto ${className}`}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className = '', ...props }, ref) => (
  <div className="absolute left-0 top-full flex justify-center">
    <NavigationMenuPrimitive.Viewport
      className={`origin-top-center relative mt-2xs h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-lg)] data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out md:w-[var(--radix-navigation-menu-viewport-width)] ${className}`}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className = '', ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={`top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out ${className}`}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-[var(--border-default)] shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
