import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ receiverId, receiverName, productId, productName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    
    if (socket) {
      socket.on('receive_message', (message) => {
        if (
          (message.sender._id === user._id && message.receiver._id === receiverId) ||
          (message.sender._id === receiverId && message.receiver._id === user._id)
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }

    return () => {
      if (socket) socket.off('receive_message');
    };
  }, [receiverId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Filter messages between current user and receiver
        const filtered = data.data.filter(msg => 
          (msg.sender._id === user._id && msg.receiver._id === receiverId) ||
          (msg.sender._id === receiverId && msg.receiver._id === user._id)
        );
        setMessages(filtered.reverse());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver: receiverId,
          product: productId,
          text: text
        })
      });
      const data = await response.json();
      if (data.success) {
        setText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-[100] overflow-hidden animate-slideUp">
      {/* Header */}
      <div className="bg-green-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="font-bold">{receiverName}</p>
            {productName && <p className="text-xs text-green-100 truncate w-40">Re: {productName}</p>}
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              msg.sender._id === user._id 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
        <button 
          disabled={loading || !text.trim()}
          className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
