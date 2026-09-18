import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { getNotificationTargetUrl } from '../../utils/notificationNavigation';

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

export default function Notifications() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.get('/notifications');
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load notifications", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [profile]);

  async function markAllRead() {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true, read: true })));
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true, read: true })));
    }
  }

  async function markRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true, read: true } : n));
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true, read: true } : n));
    }
  }

  const roleKey = profile?.role || '';
  const unread = notifications.filter(n => !n.readStatus && !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader 
        title="Notifications" 
        subtitle="Stay updated on your complaints and tasks" 
        actions={unread > 0 ? (
          <button onClick={markAllRead} className="inline-flex items-center gap-1.5 text-sm text-purple-600 font-medium hover:underline">
            <CheckCheck size={16}/> Mark all as read
          </button>
        ) : null} 
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Bell size={32} className="mx-auto mb-2 text-gray-300"/>
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const isRead = n.readStatus || n.read;
            return (
              <div 
                key={n.id} 
                onClick={() => {
                  if (!isRead) markRead(n.id);
                  const targetUrl = getNotificationTargetUrl(n, roleKey);
                  navigate(targetUrl);
                }} 
                className={`bg-white rounded-2xl border px-5 py-4 cursor-pointer transition-all hover:shadow-sm ${isRead ? 'border-gray-100' : 'border-purple-200 bg-purple-50/40'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isRead ? 'bg-gray-100' : 'bg-purple-100'}`}>
                    <Bell size={16} className={isRead ? 'text-gray-400' : 'text-purple-600'}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isRead ? 'text-gray-700' : 'text-purple-950'}`}>{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400">{timeAgo(n.createdAt || n.created_at)}</span>
                      {!isRead && <span className="w-2 h-2 bg-purple-600 rounded-full"/>}
                    </div>
                  </div>
                  {!isRead && (
                    <button 
                      onClick={e => { e.stopPropagation(); markRead(n.id); }} 
                      className="text-purple-600 hover:text-purple-800 flex-shrink-0" 
                      title="Mark as read"
                    >
                      <Check size={16}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
