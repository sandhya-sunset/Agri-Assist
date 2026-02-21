import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && token) {
      // Fetch existing notifications
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/api/notifications",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await response.json();
          if (data.success) {
            setNotifications(data.data);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();

      const newSocket = io(API_BASE_URL, {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.emit("join", String(user._id));

      newSocket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        console.log("New notification:", notification);
      });

      return () => newSocket.close();
    }
  }, [user, token]);

  const clearNotifications = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, notifications, clearNotifications }}
    >
      {children}
    </SocketContext.Provider>
  );
};
