import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Admin from './pages/Admin';
import Budgeting from './pages/Budgeting';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('budgeting');

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'admin' && <Admin />}
        {currentPage === 'budgeting' && <Budgeting />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'reports' && <Reports />}
      </main>
    </div>
  );
}

export default App;
