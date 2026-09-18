import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, Check, ExternalLink, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { getNotificationTargetUrl } from '../../utils/notificationNavigation';

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const initials = profile?.full_name || profile?.fullName
    ? (profile.full_name || profile.fullName).split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleKey = (profile?.role || '').toLowerCase().replace('role_', '');

  const roleLabel = {
    citizen: 'Citizen',
    worker: 'Worker',
    dept_head: 'Department Head',
    department_head: 'Department Head',
    district_admin: 'District Admin',
    super_admin: 'Super Admin',
    admin: 'Administrator',
  }[roleKey] || 'User';

  const rolePath = {
    citizen: 'citizen',
    worker: 'worker',
    dept_head: 'depthead',
    department_head: 'depthead',
    district_admin: 'admin',
    super_admin: 'admin',
    admin: 'admin',
  }[roleKey] || 'citizen';

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, profile]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // safe fallback
    }
  }

  async function markAsRead(id, e) {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true, read: true } : n));
    } catch (err) {}
  }

  const unreadCount = notifications.filter(n => !n.readStatus && !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-all flex items-center justify-center border border-gray-200 shadow-sm"
              title="Toggle Navigation Menu"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-purple-950 text-lg">CivicConnect</span>
          </Link>
        </div>

        {user && profile ? (
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 rounded-xl hover:bg-purple-50 transition-colors border border-gray-100"
              title="Notifications"
            >
              <Bell size={20} className="text-purple-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-extrabold bg-red-500 text-white rounded-full text-center shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showDropdown && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} />
                    <h3 className="font-bold text-sm">Notifications</h3>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} unread
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-purple-50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 6).map(n => {
                      const isRead = n.readStatus || n.read;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!isRead) markAsRead(n.id);
                            setShowDropdown(false);
                            const targetUrl = getNotificationTargetUrl(n, roleKey);
                            navigate(targetUrl);
                          }}
                          className={`p-3 text-left hover:bg-purple-50/50 cursor-pointer transition-colors ${
                            !isRead ? 'bg-purple-50/40' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold ${!isRead ? 'text-purple-950' : 'text-gray-800'}`}>
                              {n.title}
                            </p>
                            {!isRead && (
                              <button
                                type="button"
                                onClick={(e) => markAsRead(n.id, e)}
                                className="text-purple-600 hover:text-purple-800 text-[11px] font-medium"
                                title="Mark read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 bg-purple-50/50 border-t border-purple-100 text-center">
                  <Link
                    to={`/${rolePath}/notifications`}
                    onClick={() => setShowDropdown(false)}
                    className="text-xs font-bold text-purple-700 hover:underline flex items-center justify-center gap-1 py-1"
                  >
                    View All Notifications <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-2 py-1 bg-purple-50/50 hover:bg-purple-100/60 rounded-full border border-purple-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>
                <div className="hidden sm:block text-left pr-2">
                  <p className="text-xs font-semibold text-purple-950 leading-tight">
                    {profile.full_name || profile.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">{roleLabel}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-purple-950 truncate">{profile.full_name || profile.fullName || 'User'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{profile.email || ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOut();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-purple-900 px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
