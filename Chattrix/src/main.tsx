import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';
import './styles/animations.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
