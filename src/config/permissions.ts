export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Resource = 'User' | 'Event' | 'Ticket' | 'Comment' | 'Package' | 'Notification';

export interface Permission {
  action: Action;
  resource: Resource;
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    { action: 'manage', resource: 'User' },
    { action: 'manage', resource: 'Event' },
    { action: 'manage', resource: 'Ticket' },
    { action: 'manage', resource: 'Comment' },
    { action: 'manage', resource: 'Package' },
    { action: 'manage', resource: 'Notification' },
  ],
  MANAGER: [
    { action: 'read', resource: 'User' },
    { action: 'manage', resource: 'Event' },
    { action: 'manage', resource: 'Package' },
    { action: 'read', resource: 'Ticket' },
    { action: 'manage', resource: 'Comment' },
  ],
  USER: [
    { action: 'read', resource: 'Event' },
    { action: 'create', resource: 'Comment' },
    { action: 'create', resource: 'Ticket' },
    { action: 'read', resource: 'Notification' },
  ],
};
