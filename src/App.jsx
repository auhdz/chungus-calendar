import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import LandingPage from './components/LandingPage';
import CalendarPage from './components/CalendarPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/g/:groupId" element={<CalendarPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
