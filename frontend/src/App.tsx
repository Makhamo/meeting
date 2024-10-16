import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartMeeting from './pages/StartMeeting';
import Chat from './pages/Chat';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<StartMeeting />} />
        
        
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;
