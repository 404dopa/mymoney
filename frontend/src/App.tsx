import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { ExpensesPage } from './pages/Expenses/ExpensesPage';
import { IncomePage } from './pages/Income/IncomePage';
import { StatisticsPage } from './pages/Statistics/StatisticsPage';
import { CardModalProvider } from './context/CardModalContext';
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CardModalProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/expenses" replace />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="*" element={<Navigate to="/expenses" replace />} />
            </Routes>
          </main>
        </div>
      </CardModalProvider>
    </BrowserRouter>
  );
};

export default App;
