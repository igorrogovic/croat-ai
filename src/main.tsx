import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ClerkWrapper } from './components/ClerkWrapper.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkWrapper>
      <App />
    </ClerkWrapper>
  </StrictMode>
);
