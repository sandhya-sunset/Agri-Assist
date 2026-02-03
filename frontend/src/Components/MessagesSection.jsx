import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, Star, Archive, MoreVertical, Phone, Video, Image as ImageIcon, Smile, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const MessagesSection = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();

    if (socket) {
      socket.on('receive_message', (message) => {
        const contact = message.sender._id === user._id ? message.receiver : message.sender;
        
        setConversations(prevConvs => {
          const existingConv = prevConvs.find(c => c.id === contact._id);
          const newMessage = {
            id: message._id,
            sender: message.sender._id === user._id ? 'seller' : 'customer',
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString(),
            read: message.isRead
          };

          if (existingConv) {
            return prevConvs.map(c => 
              c.id === contact._id 
                ? { 
                    ...c, 
                    messages: [newMessage, ...c.messages],
                    lastMessage: message.text,
                    time: 'Just now',
                    unread: message.sender._id !== user._id ? c.unread + 1 : c.unread
                  } 
                : c
            );
          } else {
            return [{
              id: contact._id,
              customer: contact.name,
              email: contact.email,
              avatar: contact.name.charAt(0).toUpperCase(),
              lastMessage: message.text,
              time: 'Just now',
              unread: message.sender._id !== user._id ? 1 : 0,
              isOnline: false,
              messages: [newMessage]
            }, ...prevConvs];
          }
        });

        // Also update selected conversation if it matches
        setSelectedConversation(prev => {
            if (prev && prev.id === contact._id) {
                return {
                    ...prev,
                    messages: [{
                        id: message._id,
                        sender: message.sender._id === user._id ? 'seller' : 'customer',
                        text: message.text,
                        time: new Date(message.createdAt).toLocaleTimeString(),
                        read: message.isRead
                    }, ...prev.messages]
                };
            }
            return prev;
        });
      });
    }

    return () => {
      if (socket) socket.off('receive_message');
    };
  }, [socket]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Group messages by contact
        const groups = {};
        data.data.forEach(msg => {
          const contact = msg.sender._id === user._id ? msg.receiver : msg.sender;
          if (!groups[contact._id]) {
            groups[contact._id] = {
              id: contact._id,
              customer: contact.name,
              email: contact.email,
              avatar: contact.name.charAt(0).toUpperCase(),
              lastMessage: msg.text,
              time: new Date(msg.createdAt).toLocaleTimeString(),
              unread: msg.isRead ? 0 : 1,
              isOnline: false,
              messages: []
            };
          }
          groups[contact._id].messages.push({
            id: msg._id,
            sender: msg.sender._id === user._id ? 'seller' : 'customer',
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString(),
            read: msg.isRead
          });
        });
        setConversations(Object.values(groups));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation) {
      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            receiver: selectedConversation.id,
            text: messageText
          })
        });
        const data = await response.json();
        if (data.success) {
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
      conv.id === convId ? { ...conv, unread: 0, status: 'read' } : conv
    ));
  };

  const toggleStar = (convId) => {
    setConversations(conversations.map(conv =>
      conv.id === convId ? { ...conv, starred: !conv.starred } : conv
    ));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Messages</h2>
          <p className="text-gray-500 mt-1">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="flex h-full">
          {/* Conversations List Sidebar */}
          <div className="w-full sm:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
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
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{conv.avatar}</span>
                        </div>
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-semibold text-gray-800 truncate ${conv.unread > 0 ? 'text-gray-900' : ''}`}>
                            {conv.customer}
                          </p>
                          {conv.unread > 0 && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 font-semibold">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1 truncate">{conv.email}</p>
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
                  <p className="text-sm mt-1">Try a different search term</p>
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{selectedConversation.avatar}</span>
                        </div>
                        {selectedConversation.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedConversation.customer}</p>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.isOnline ? (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Online
                            </span>
                          ) : (
                            'Offline'
                          )}
                        </p>
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
                        title="Archive"
                      >
                        <Archive size={20} className="text-gray-600" />
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
                      className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      <div className={`max-w-md ${msg.sender === 'seller' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.sender === 'seller'
                              ? 'bg-green-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="break-words leading-relaxed">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 px-2 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                          <p className="text-xs text-gray-500">
                            {msg.time}
                          </p>
                          {msg.sender === 'seller' && (
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none max-h-32"
                      style={{ minHeight: '42px' }}
                    />
                    
                    <button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
                        messageText.trim() 
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
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
                  <p className="text-sm text-gray-500">Choose a message from the left to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: conversations.length, color: 'blue', icon: '💬' },
          { label: 'Unread Messages', value: totalUnread, color: 'red', icon: '🔔' },
          { label: 'Avg Response Time', value: '< 5 min', color: 'green', icon: '⚡' },
          { label: 'Satisfaction Rate', value: '98%', color: 'purple', icon: '⭐' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
  );
};

export default MessagesSection;