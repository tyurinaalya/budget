import React from 'react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <aside className="sidebar">
      <h1>💰 Budget Manager</h1>
      <nav>
        <ul>
          <li>
            <button
              className={currentPage === 'budgeting' ? 'active' : ''}
              onClick={() => setCurrentPage('budgeting')}
            >
              📊 Budgeting
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'analytics' ? 'active' : ''}
              onClick={() => setCurrentPage('analytics')}
            >
              📈 Analytics
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'reports' ? 'active' : ''}
              onClick={() => setCurrentPage('reports')}
            >
              📄 Reports
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'admin' ? 'active' : ''}
              onClick={() => setCurrentPage('admin')}
            >
              ⚙️ Admin
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
