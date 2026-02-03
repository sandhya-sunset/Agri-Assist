import React from 'react';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import { Bell, MessageSquare, Trash2, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const NotificationPage = () => {
  const { notifications, clearNotifications } = useSocket();
  const { user, token } = useAuth(); // Needed for manual delete if implemented 
  const navigate = useNavigate();
  const { addToast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Function to mark a single notification as read (simulated/backend)
  const markAsRead = async (id, link) => {
    try {
        await fetch(`http://localhost:5000/api/notifications/${id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Also trigger socket context update? 
        // For now assumed context handles localized updates or we refresh
        // In this implementation, we rely on the context's effect or assume the link nav is enough

        if (link) navigate(link);
    } catch (error) {
        console.error('Error marking as read:', error);
    }
  };

  const handleClearAll = async () => {
      if(window.confirm('Clear all notifications?')) {
          await clearNotifications();
          addToast('All notifications cleared', 'success');
      }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl text-green-600">
                        <Bell size={24} />
                    </div>
                    Notifications
                </h1>
                <p className="text-gray-500 mt-1 ml-14">
                    You have <span className="font-bold text-green-600">{unreadCount}</span> unread notifications
                </p>
            </div>
            {notifications.length > 0 && (
                <button 
                    onClick={handleClearAll}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                >
                    <Trash2 size={18} />
                    Clear All
                </button>
            )}
        </div>

        {/* List */}
        <div className="space-y-4">
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <div 
                        key={notification._id}
                        onClick={() => markAsRead(notification._id, notification.link)}
                        className={`group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                            !notification.isRead ? 'border-l-4 border-l-green-500' : ''
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${
                                notification.type === 'message' ? 'bg-blue-50 text-blue-600' :
                                notification.type === 'success' ? 'bg-green-50 text-green-600' :
                                'bg-gray-50 text-gray-600'
                            }`}>
                                {notification.type === 'message' ? <MessageSquare size={20} /> : 
                                 notification.type === 'success' ? <CheckCircle size={20} /> :
                                 <Info size={20} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold text-gray-900 truncate pr-4 ${!notification.isRead ? 'text-black' : 'text-gray-600'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                        
                        {!notification.isRead && (
                            <div className="absolute top-5 right-5 w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Notifications</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        We'll notify you when you receive messages, orders, or updates about your products.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
