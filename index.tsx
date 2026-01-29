import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("HeartPath: App initialization starting...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("HeartPath: Could not find root element to mount to!");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("HeartPath: App rendered successfully.");
  } catch (err) {
    console.error("HeartPath: Render failed:", err);
  }
}