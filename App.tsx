import React from 'react';
import LandingPage from './pages/LandingPage';

/**
 * App Component
 * 
 * Functions as the layout wrapper and router.
 * Since this is a SPA landing page, we render LandingPage directly.
 */
function App() {
  return (
    <LandingPage />
  );
}

export default App;