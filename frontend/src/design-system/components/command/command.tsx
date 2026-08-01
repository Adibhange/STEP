'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog, DialogContent, DialogOverlay } from '../dialog';
import { Icon } from '../../icon';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className = '', ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={`flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-1)] text-[var(--text-primary)] ${className}`}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogOverlay />
      <DialogContent className="overflow-hidden p-0 shadow-[var(--shadow-xl)] max-w-2xl border-[var(--border-default)]">
        <Command className="[&_[cmdk-group-heading]]:px-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--text-tertiary)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-3xs [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-xs [&_[cmdk-item]]:py-2xs [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className = '', ...props }, ref) => (
  <div className="flex items-center border-b border-[var(--border-default)] px-sm" cmdk-input-wrapper="">
    <Icon name="search" size="xs" className="mr-xs shrink-0 opacity-50 text-[var(--text-tertiary)]" />
    <CommandPrimitive.Input
      ref={ref}
      className={`flex h-11 w-full rounded-md bg-transparent py-sm text-[length:var(--type-body-md-size)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)] ${className}`}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className = '', ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={`max-h-[300px] overflow-y-auto overflow-x-hidden p-3xs ${className}`}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-lg text-center text-[length:var(--type-body-md-size)] text-[var(--text-tertiary)]"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className = '', ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={`overflow-hidden p-3xs text-[var(--text-primary)] [&_[cmdk-group-heading]]:px-xs [&_[cmdk-group-heading]]:py-2xs [&_[cmdk-group-heading]]:text-[length:var(--type-label-size)] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-tertiary)] ${className}`}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={`-mx-3xs h-px bg-[var(--border-default)] ${className}`}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className = '', ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center gap-xs rounded-[var(--radius-sm)] px-xs py-2xs text-[length:var(--type-body-md-size)] outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-[var(--surface-hover)] data-[selected=true]:text-[var(--text-primary)] data-[disabled=true]:opacity-[var(--opacity-disabled)] ${className}`}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
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
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
