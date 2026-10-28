import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CookieConsentBanner from '../components/CookieConsentBanner';
import { ErrorBoundary } from '../components/ErrorBoundary';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Header />
      <main className="flex-1 flex flex-col">
        <ErrorBoundary fallbackTitle="Page Error Encountered">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

export default MainLayout;
