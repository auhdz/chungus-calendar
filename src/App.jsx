import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
    </BrowserRouter>
  );
}

export default App;
