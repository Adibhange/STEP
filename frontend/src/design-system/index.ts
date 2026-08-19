/**
 * STEP Enterprise Platform — Design System Master Export Surface
 *
 * Single public API surface for the entire STEP Design System.
 * All application modules import components and utilities exclusively from @/design-system.
 *
 * Implementation Strategy:
 * Complex primitives (Dialog, Drawer, Popover, Select, CustomSelect, DropdownMenu, Tooltip, Tabs,
 * Accordion, Command, ContextMenu, HoverCard, NavigationMenu, Calendar, DatePicker,
 * Menubar, ResizablePanels, Toast) wrap underlying Radix UI / Sonner engines while
 * consuming STEP Design Tokens and exposing a stable, clean STEP API.
 */

// Foundation Primitives (Owned by STEP)
export { Button } from './components/button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/button';

export { Input } from './components/input';
export type { InputProps, InputSize } from './components/input';

export { Badge } from './components/badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './components/badge';

export { Spinner } from './components/spinner';
export type { SpinnerProps } from './components/spinner';

export { Divider } from './components/divider';
export type { DividerProps, DividerOrientation } from './components/divider';

export { Avatar } from './components/avatar';
export type { AvatarProps, AvatarSize } from './components/avatar';

export { Skeleton } from './components/skeleton';
export type { SkeletonProps, SkeletonVariant } from './components/skeleton';

export { Kbd } from './components/kbd';
export type { KbdProps } from './components/kbd';

// Complex Wrapped Primitives (Radix UI / Vaul / cmdk / DayPicker Wrapped)
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';

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
} from './components/drawer';

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose } from './components/popover';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/select';

export { CustomSelect } from '@/features/shared/select/CustomSelect';
export type { CustomSelectProps, SelectOption } from '@/features/shared/select/CustomSelect';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/dropdown-menu';

export { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from './components/tooltip';
export type { TooltipProps, TooltipPosition } from './components/tooltip';

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/accordion';

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
} from './components/command';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './components/context-menu';

export { HoverCard, HoverCardTrigger, HoverCardContent } from './components/hover-card';

export { Calendar } from './components/calendar';
export type { CalendarProps } from './components/calendar';

export { DatePicker } from './components/date-picker';
export type { DatePickerProps } from './components/date-picker';

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
} from './components/menubar';

export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/resizable';

// Navigation Components
export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent } from './navigation/tabs';
export type { TabsProps, TabItem } from './navigation/tabs';

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from './navigation/navigation-menu';

// Form Controls
export { PinInput } from './forms/pin-input';
export type { PinInputProps } from './forms/pin-input';

export { Checkbox } from './forms/checkbox';
export type { CheckboxProps } from './forms/checkbox';

// Data Display Components
export { Card } from './data-display/card';
export type { CardProps } from './data-display/card';

// Redux Global Notification Actions & Error Extractor
export {
  enqueue as enqueueNotification,
  remove as removeNotification,
  clear as clearNotifications,
  update as updateNotification,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyLoading,
  extractErrorMessage,
  ENTERPRISE_SUCCESS_MESSAGES,
  ENTERPRISE_ERROR_MESSAGES,
} from '@/store';
export type { NotificationItem, NotificationVariant, NotificationAction } from '@/store';

// Icon Layer Abstraction
export { Icon } from './icon';
export type { IconProps, IconSizeKey, IconStrokeKey, IconColorToken, IconName } from './icon';

// Motion System Programmatic Tokens & Framer Motion Variants
export { MOTION_DURATIONS } from './motion/durations';
export { EASING_CURVES, EASING_CSS_STRINGS } from './motion/easing';
export {
  staggerContainer,
  staggerFastContainer,
  kpiCardVariant,
  tactilePopCardVariant,
  tactilePopItemVariant,
  fadeSlideUpVariant,
  scalePopVariant,
  elasticDialogVariant,
  dialogBackdropVariant,
  dialogContentBlossomVariant,
} from './motion/variants';

// UI Utilities & Ref Helpers
export { composeRefs } from './utils/compose-refs';
export { getFocusableElements, focusFirstElement } from './utils/focus-utils';
