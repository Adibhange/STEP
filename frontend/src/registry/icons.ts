import React from 'react';
import {
  Users,
  UserCheck,
  FileCheck,
  Award,
  CheckCircle2,
  Clock,
  ShieldAlert,
  TrendingUp,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  UserX,
  Play,
  Moon,
  Sun,
  Monitor,
  Eye,
  Settings,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Calendar as CalendarIcon,
  Check,
  X,
  SlidersHorizontal,
  Bookmark,
  Pin,
  Lock,
  FileText,
  Building2,
  Briefcase,
  HelpCircle,
  BarChart3,
  ListFilter
} from 'lucide-react';

export const IconRegistry = {
  Users,
  UserCheck,
  FileCheck,
  Award,
  CheckCircle2,
  Clock,
  ShieldAlert,
  TrendingUp,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  UserX,
  Play,
  Moon,
  Sun,
  Monitor,
  Eye,
  Settings,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Calendar: CalendarIcon,
  Check,
  X,
  SlidersHorizontal,
  Bookmark,
  Pin,
  Lock,
  FileText,
  Building2,
  Briefcase,
  HelpCircle,
  BarChart3,
  ListFilter
};

export type IconName = keyof typeof IconRegistry;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className = '' }: IconProps) {
  const IconComp = IconRegistry[name] as any;
  if (!IconComp) return null;
  return React.createElement(IconComp, { size, className });
}
