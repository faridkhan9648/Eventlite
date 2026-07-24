import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = '', 
  size = 'md', 
  className = '',
  children
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (children) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-blue-900 text-white flex items-center justify-center font-medium ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
    />
  );
};

export { Avatar };
