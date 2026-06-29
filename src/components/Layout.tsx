import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  rightPanelOpen: boolean;
}

export default function Layout({ children, rightPanelOpen }: LayoutProps) {
  return (
    <main 
      className={`min-h-screen p-4 md:p-6 transition-all duration-300 ${
        rightPanelOpen ? 'lg:mr-80' : ''
      }`}
    >
      {children}
    </main>
  );
}