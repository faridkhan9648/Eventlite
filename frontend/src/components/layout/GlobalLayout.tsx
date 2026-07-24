import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface GlobalLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  onSidebarClose?: () => void;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({ 
  showSidebar = false, 
  onSidebarClose 
}) => {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex">
        <Sidebar 
          isOpen={showSidebar} 
          onClose={onSidebarClose} 
        />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
