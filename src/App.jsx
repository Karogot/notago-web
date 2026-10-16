import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import History from './pages/History';
import NoteDetail from './pages/NoteDetail';
import ShoppingList from './pages/ShoppingList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/history" element={<History />} />
        <Route path="/note/:id" element={<NoteDetail />} />
        <Route path="/lista" element={<ShoppingList />} />
      </Routes>
    </Router>
  );
}

export default App;
