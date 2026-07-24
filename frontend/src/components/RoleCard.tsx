import React from 'react';
import { Card, CardContent } from './ui';
import { cn } from '../utils/cn';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  className?: string;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  icon,
  title,
  description,
  features,
  className
}) => {
  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-xl h-full',
      className
    )}>
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex items-center justify-center w-12 h-12 bg-accent-100 rounded-lg text-accent-600 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600 text-sm mb-4 flex-grow">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-neutral-700">
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
