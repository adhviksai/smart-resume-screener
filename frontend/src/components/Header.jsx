import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-2 py-1 font-medium transition-colors duration-300 
    ${isActive ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-600' : 'text-gray-600 hover:text-blue-500'}`;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white shadow-sm"
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'}
          className="text-2xl font-bold text-gray-800 tracking-tight hover:text-blue-600 transition-colors duration-300"
        >
          ResumeScreener
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {user && (
            <>
              {user.role === 'user' && (
                <NavLink to="/dashboard" className={navLinkClass}>
                  My Dashboard
                </NavLink>
              )}
              {user.role === 'recruiter' && (
                <NavLink to="/recruiter/dashboard" className={navLinkClass}>
                  Recruiter Dashboard
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center">
          {user ? (
            <>
              <span className="text-gray-700 mr-4 hidden sm:block">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-300"
            >
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
