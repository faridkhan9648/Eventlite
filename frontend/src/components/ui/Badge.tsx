import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'info', 
  size = 'md',
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

// Status-specific badges for events
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    draft: { variant: 'warning' as const, label: 'Draft' },
    published: { variant: 'success' as const, label: 'Published' },
    closed: { variant: 'danger' as const, label: 'Closed' },
    cancelled: { variant: 'danger' as const, label: 'Cancelled' }
  };

  const config = statusConfig[status.toLowerCase()] || { variant: 'info' as const, label: status };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
};

// Role-specific badges
export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleConfig = {
    super_admin: { variant: 'danger' as const, label: 'Super Admin' },
    event_creator: { variant: 'primary' as const, label: 'Event Creator' },
    staff: { variant: 'info' as const, label: 'Staff' },
    attendee: { variant: 'default' as const, label: 'Attendee' }
  };

  const config = roleConfig[role.toLowerCase()] || { variant: 'default' as const, label: role };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
};

export { Badge };
