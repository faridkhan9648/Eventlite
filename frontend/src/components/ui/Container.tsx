import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  size = 'xl'
}) => {
  const sizeClasses = {
    sm: 'container-sm',
    md: 'container-md',
    lg: 'container-lg',
    xl: 'container-xl',
    full: 'container-full'
  };

  return (
    <div className={`container ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

export { Container };
