// src/App.js

import React from 'react';
import Weather from './components/Weather';
import './App.css';

function App() {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <Weather />
      
    </div>
  );
}

export default App;

// min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4