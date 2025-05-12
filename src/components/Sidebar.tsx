import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, Home, Upload, Users, CheckSquare, Package, BarChart3, Settings, Archive
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/import', name: 'Import Data', icon: Upload },
    { path: '/attendees', name: 'Attendees', icon: Users },
    { path: '/checkin', name: 'Check-in', icon: CheckSquare },
    { path: '/distribution', name: 'Distribution', icon: Package },
    { path: '/reports', name: 'Reports', icon: BarChart3 },
    { path: '/archived', name: 'Archived Events', icon: Archive },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  const activeClass = 'bg-primary-50 text-primary-700';
  const inactiveClass = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  
  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform ease-in-out duration-300 lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-primary-100 p-1.5 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y1="6"></line>
                <line x1="8" x2="8" y1="2" y1="6"></line>
                <line x1="3" x2="21" y1="10" y1="10"></line>
                <path d="m9 16 2 2 4-4"></path>
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">EventFlow</span>
          </div>
          <button
            className="p-1 text-gray-500 rounded-md lg:hidden hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={closeSidebar}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="px-3 py-4 h-[calc(100%-4rem)] overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                      ${isActive ? activeClass : inactiveClass}
                    `}
                    onClick={() => closeSidebar()}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;