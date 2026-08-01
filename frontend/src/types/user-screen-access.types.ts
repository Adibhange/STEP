export interface UserScreenAccess {
  screenId?: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExecute?: boolean;
}
