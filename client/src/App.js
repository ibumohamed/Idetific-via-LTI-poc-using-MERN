import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import StudentPage from './pages/StudentPage';
import Layout from './pages/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="admin" element={<AdminPage />} />
          <Route path="student" element={<StudentPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
