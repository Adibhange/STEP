'use client';

import React from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Upload, 
  Download, 
  Play, 
  Check, 
  Lock, 
  Unlock, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button, ButtonProps } from './ActionButton';

export const AddButton: React.FC<ButtonProps> = (props) => (
  <Button variant="primary" icon={Plus} {...props}>
    {props.children || 'Add New'}
  </Button>
);

export const EditButton: React.FC<ButtonProps> = (props) => (
  <Button variant="edit" icon={Pencil} {...props}>
    {props.children || 'Edit'}
  </Button>
);

export const DeleteButton: React.FC<ButtonProps> = (props) => (
  <Button variant="delete" icon={Trash2} {...props}>
    {props.children || 'Delete'}
  </Button>
);

export const ViewButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" icon={Eye} {...props}>
    {props.children || 'View'}
  </Button>
);

export const SaveButton: React.FC<ButtonProps> = (props) => (
  <Button variant="primary" icon={Save} {...props}>
    {props.children || 'Save'}
  </Button>
);

export const CancelButton: React.FC<ButtonProps> = (props) => (
  <Button variant="ghost" icon={X} {...props}>
    {props.children || 'Cancel'}
  </Button>
);

export const ApplyButton: React.FC<ButtonProps> = (props) => (
  <Button variant="success" icon={Check} {...props}>
    {props.children || 'Apply'}
  </Button>
);

export const UploadButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" icon={Upload} {...props}>
    {props.children || 'Upload'}
  </Button>
);

export const ExportButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" icon={Download} {...props}>
    {props.children || 'Export'}
  </Button>
);

export const ImportButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" icon={Upload} {...props}>
    {props.children || 'Import'}
  </Button>
);

export const ExecuteTestButton: React.FC<ButtonProps> = (props) => (
  <Button variant="success" icon={Play} {...props}>
    {props.children || 'Run Test'}
  </Button>
);

export const FirstPageButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" size="xs" icon={ChevronsLeft} {...props} />
);

export const PrevPageButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" size="xs" icon={ChevronLeft} {...props} />
);

export const NextPageButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" size="xs" icon={ChevronRight} {...props} />
);

export const LastPageButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" size="xs" icon={ChevronsRight} {...props} />
);

export const SelectAllButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" size="xs" {...props}>
    {props.children || 'Select All'}
  </Button>
);

export const ClearButton: React.FC<ButtonProps> = (props) => (
  <Button variant="ghost" size="xs" icon={X} {...props}>
    {props.children || 'Clear'}
  </Button>
);

export const SortButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" size="xs" {...props}>
    {props.children || 'Sort'}
  </Button>
);

export const IconButton: React.FC<ButtonProps> = (props) => (
  <Button variant="ghost" size="xs" className="p-1 h-7 w-7 rounded-full" {...props} />
);

export const SearchButton: React.FC<ButtonProps> = (props) => (
  <Button variant="primary" icon={Search} {...props}>
    {props.children || 'Search'}
  </Button>
);

export const PreviewButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" icon={Eye} {...props}>
    {props.children || 'Preview'}
  </Button>
);
