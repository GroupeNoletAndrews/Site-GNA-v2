import React from 'react';
import { I18nProvider } from './contexts/I18nContext';
import LandingPage from './pages/LandingPage';

/**
 * App Component
 * 
 * Functions as the layout wrapper and router.
 * Since this is a SPA landing page, we render LandingPage directly.
 */
function App() {
  return (
    <I18nProvider>
      <LandingPage />
    </I18nProvider>
  );
}

export default App;