
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("CRITICAL ERROR: ROOT ELEMENT NOT FOUND.");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("PHONK SYSTEMS UPLINK ESTABLISHED.");
  } catch (err) {
    console.error("FAILED TO MOUNT APPLICATION:", err);
    rootElement.innerHTML = `
      <div style="color: #ef4444; padding: 40px; text-align: center; font-family: monospace;">
        <h1 style="font-size: 40px;">BOOT ERROR</h1>
        <p style="font-size: 14px;">CHECK CONSOLE FOR DETAILS</p>
      </div>
    `;
  }
};

// Ensure we wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
