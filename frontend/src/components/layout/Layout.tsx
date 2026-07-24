import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Container } from '../ui';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  sidebarOpen?: boolean;
  onSidebarClose?: () => void;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showHeader = true,
  showSidebar = false,
  sidebarOpen = false,
  onSidebarClose,
  className
}) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      {showHeader && <Header title={title} />}

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={onSidebarClose}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 transition-all duration-150 ease-in-out',
          showSidebar && 'lg:ml-64',
          className
        )}>
          <Container size="lg" className="py-6">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
};

export { Layout };
