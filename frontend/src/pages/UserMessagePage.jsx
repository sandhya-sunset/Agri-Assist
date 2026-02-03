import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, Paperclip, Star, Archive, MoreVertical, Phone, Video, 
  ImageIcon, Smile, X, Package, ShoppingBag, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserMessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await api.get('/messages');
      const data = response.data;
      
        const groups = {};
        
        data.data.forEach(msg => {
          if (!msg.sender || !msg.receiver) return;
          
          const currentUserId = user?._id?.toString();
          const senderId = msg.sender?._id?.toString();
          
          const contact = senderId === currentUserId ? msg.receiver : msg.sender;
          
          if (!contact || !contact._id) return;

          if (!groups[contact._id]) {
            groups[contact._id] = {
              id: contact._id,
              sellerName: contact.name || contact.email || 'Unknown User',
              email: contact.email,
              avatar: (contact.name || 'U').charAt(0).toUpperCase(),
              lastMessage: msg.text,
              time: new Date(msg.createdAt).toLocaleTimeString(),
              unread: msg.isRead ? 0 : 1,
              isOnline: false,
              productName: msg.product?.name || 'General Inquiry',
              messages: []
            };
          }
          groups[contact._id].messages.push({
            id: msg._id,
            sender: senderId === currentUserId ? 'user' : 'seller',
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString(),
            read: msg.isRead
          });
        });
        setConversations(Object.values(groups));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation) {
      try {
        const response = await api.post('/messages', {
          receiver: selectedConversation.id,
          text: messageText
        });
        const data = response.data;
        
        if (data.success) {
          const newMessage = {
            id: data.data._id,
            sender: 'user',
            text: messageText,
            time: new Date().toLocaleTimeString(),
            read: false
          };
          
          setSelectedConversation(prev => ({
            ...prev,
            messages: [newMessage, ...prev.messages]
          }));
          
          setConversations(convs => convs.map(c => 
            c.id === selectedConversation.id 
              ? { ...c, messages: [newMessage, ...c.messages], lastMessage: messageText, time: 'Just now' }
              : c
          ));
          
          setMessageText('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = (convId) => {
    setConversations(conversations.map(conv =>
      conv.id === convId ? { ...conv, unread: 0 } : conv
    ));
  };

  const toggleStar = (convId) => {
    setConversations(conversations.map(conv =>
      conv.id === convId ? { ...conv, starred: !conv.starred } : conv
    ));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="flex h-full">
            {/* Conversations List Sidebar */}
            <div className="w-full sm:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search sellers or products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-green-600" size={32} />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        markAsRead(conv.id);
                      }}
                      className={`p-4 border-b border-gray-200 cursor-pointer transition-all ${
                        selectedConversation?.id === conv.id 
                          ? 'bg-green-50 border-l-4 border-l-green-600' 
                          : 'hover:bg-white'
                      } ${conv.unread > 0 ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{conv.avatar}</span>
                          </div>
                          {conv.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-semibold text-gray-800 truncate ${conv.unread > 0 ? 'text-gray-900' : ''}`}>
                              {conv.sellerName}
                            </p>
                            {conv.unread > 0 && (
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 font-semibold">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mb-1">
                            <Package size={12} className="text-green-600 flex-shrink-0" />
                            <p className="text-xs text-green-600 font-medium truncate">{conv.productName}</p>
                          </div>
                          
                          <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-700' : 'text-gray-600'}`}>
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{conv.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold">No conversations found</p>
                    <p className="text-sm mt-1">Start chatting with sellers from product pages</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 flex flex-col hidden sm:flex bg-white">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{selectedConversation.avatar}</span>
                          </div>
                          {selectedConversation.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{selectedConversation.sellerName}</p>
                          <div className="flex items-center gap-1.5">
                            <Package size={12} className="text-green-600" />
                            <p className="text-sm text-green-600 font-medium">{selectedConversation.productName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voice Call"
                        >
                          <Phone size={20} className="text-gray-600" />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Video Call"
                        >
                          <Video size={20} className="text-gray-600" />
                        </button>
                        <button 
                          onClick={() => toggleStar(selectedConversation.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Star Conversation"
                        >
                          <Star 
                            size={20} 
                            className={selectedConversation.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} 
                          />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreVertical size={20} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white flex flex-col-reverse">
                    <div ref={messagesEndRef} />
                    {selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      >
                        <div className={`max-w-md ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                              msg.sender === 'user'
                                ? 'bg-green-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            }`}
                          >
                            <p className="break-words leading-relaxed">{msg.text}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 px-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-xs text-gray-500">{msg.time}</p>
                            {msg.sender === 'user' && (
                              <span className="text-xs text-gray-500">
                                {msg.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex-shrink-0"
                        title="Attach File"
                      >
                        <Paperclip size={20} />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex-shrink-0"
                        title="Send Image"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex-shrink-0"
                        title="Emoji"
                      >
                        <Smile size={20} />
                      </button>
                      
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows="1"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none max-h-32"
                        style={{ minHeight: '42px' }}
                      />
                      
                      <button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                          messageText.trim() 
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Send Message"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-2">
                      Press <span className="font-semibold">Enter</span> to send, <span className="font-semibold">Shift + Enter</span> for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Send size={36} className="text-green-600" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</p>
                    <p className="text-sm text-gray-500">Choose a seller from the left to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Active Chats', value: conversations.length, color: 'blue', icon: '💬' },
            { label: 'Unread', value: totalUnread, color: 'red', icon: '🔔' },
            { label: 'Products Inquired', value: new Set(conversations.map(c => c.productName)).size, color: 'green', icon: '📦' },
            { label: 'Avg Response', value: '< 2h', color: 'purple', icon: '⚡' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs font-semibold text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-full`}>
                  Active
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserMessagesPage;