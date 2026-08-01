import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  /** Alt text / Entity name */
  name?: string;
  /** Size token: 'sm' (24px), 'md' (32px), 'lg' (40px). Default: 'md' */
  size?: AvatarSize;
  /** Status indicator dot token ('success', 'warning', 'danger', 'offline') */
  statusDot?: 'success' | 'warning' | 'danger' | 'offline';
}
