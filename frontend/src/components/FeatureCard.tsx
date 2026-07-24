import React from 'react';
import { Card, CardContent } from './ui';
import { cn } from '../utils/cn';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className
}) => {
  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-xl',
      className
    )}>
      <CardContent className="p-0">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg text-primary-600 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};
