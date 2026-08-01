import {
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  UserRound,
  Settings2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  MoveRight,
  Mail,
  Trash2,
  Download,
  Plus,
  Edit2,
  ExternalLink,
  Lock,
  Unlock,
  Grid,
  List,
  Loader2,
  BriefcaseBusiness,
  ShieldCheck,
  Building2,
  GripVertical,
  MoreVertical,
  type LucideIcon,
} from 'lucide-react';

export type IconName =
  | 'search'
  | 'close'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'calendar'
  | 'filter'
  | 'user'
  | 'settings'
  | 'bell'
  | 'check-circle'
  | 'alert-triangle'
  | 'x-circle'
  | 'info'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up-down'
  | 'move-right'
  | 'mail'
  | 'trash'
  | 'download'
  | 'plus'
  | 'edit'
  | 'external-link'
  | 'lock'
  | 'unlock'
  | 'grid'
  | 'list'
  | 'spinner'
  | 'loader'
  | 'briefcase'
  | 'shield'
  | 'building'
  | 'grip-vertical'
  | 'more-vertical';

export const iconRegistry: Record<IconName, LucideIcon> = {
  'search': Search,
  'close': X,
  'check': Check,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'calendar': Calendar,
  'filter': Filter,
  'user': UserRound,
  'settings': Settings2,
  'bell': Bell,
  'check-circle': CheckCircle2,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  'info': Info,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-down': ArrowUpDown,
  'move-right': MoveRight,
  'mail': Mail,
  'trash': Trash2,
  'download': Download,
  'plus': Plus,
  'edit': Edit2,
  'external-link': ExternalLink,
  'lock': Lock,
  'unlock': Unlock,
  'grid': Grid,
  'list': List,
  'spinner': Loader2,
  'loader': Loader2,
  'briefcase': BriefcaseBusiness,
  'shield': ShieldCheck,
  'building': Building2,
  'grip-vertical': GripVertical,
  'more-vertical': MoreVertical,
};
