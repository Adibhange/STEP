'use client';

import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { Icon } from '../../icon';

const MenubarMenu = MenubarPrimitive.Menu;
const MenubarGroup = MenubarPrimitive.Group;
const MenubarPortal = MenubarPrimitive.Portal;
const MenubarSub = MenubarPrimitive.Sub;
const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className = '', ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={`flex h-[var(--button-height-md)] items-center space-x-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)] p-3xs ${className}`}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className = '', ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={`flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] px-xs py-2xs text-[length:var(--type-body-md-size)] font-medium text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:text-[var(--text-primary)] data-[state=open]:bg-[var(--surface-hover)] data-[state=open]:text-[var(--text-primary)] ${className}`}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className = '', inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={`flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] px-xs py-2xs text-[length:var(--type-body-md-size)] outline-none focus:bg-[var(--surface-hover)] data-[state=open]:bg-[var(--surface-hover)] ${
      inset ? 'pl-md' : ''
    } ${className}`}
    {...props}
  >
    {children}
    <Icon name="chevron-right" size="xs" className="ml-auto opacity-60" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className = '', ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={`z-[var(--z-dropdown)] min-w-[8rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] p-3xs text-[var(--text-primary)] shadow-[var(--shadow-lg)] data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out ${className}`}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className = '', align = 'start', alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={`z-[var(--z-dropdown)] min-w-[12rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] p-3xs text-[var(--text-primary)] shadow-[var(--shadow-lg)] data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out ${className}`}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className = '', inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center gap-xs rounded-[var(--radius-sm)] px-xs py-2xs text-[length:var(--type-body-md-size)] outline-none focus:bg-[var(--surface-hover)] focus:text-[var(--text-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--opacity-disabled)] ${
      inset ? 'pl-md' : ''
    } ${className}`}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className = '', children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] py-2xs pl-md pr-xs text-[length:var(--type-body-md-size)] outline-none focus:bg-[var(--surface-hover)] focus:text-[var(--text-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--opacity-disabled)] ${className}`}
    checked={checked}
    {...props}
  >
    <span className="absolute left-xs flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Icon name="check" size="xs" className="text-[var(--accent-indigo)]" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className = '', children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] py-2xs pl-md pr-xs text-[length:var(--type-body-md-size)] outline-none focus:bg-[var(--surface-hover)] focus:text-[var(--text-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--opacity-disabled)] ${className}`}
    {...props}
  >
    <span className="absolute left-xs flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className = '', inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={`px-xs py-2xs text-[length:var(--type-label-size)] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] ${
      inset ? 'pl-md' : ''
    } ${className}`}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={`-mx-3xs my-3xs h-px bg-[var(--border-default)] ${className}`}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={`ml-auto font-mono text-[length:var(--type-mono-size)] tracking-widest text-[var(--text-tertiary)] ${className}`}
      {...props}
    />
  );
};
MenubarShortcut.displayName = 'MenubarShortcut';

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarShortcut,
  MenubarGroup,
};
