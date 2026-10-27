import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../utils/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    // Initialize socket connection using backend API URL if configured
    const socketHost = API_BASE_URL || window.location.origin;
    const newSocket = io(socketHost, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);

      // Join user specific room if user is logged in
      if (user?._id) {
        newSocket.emit('join_user_room', user._id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for general parking alerts
    newSocket.on('alert:new', (data) => {
      console.log('Real-time parking alert:', data);
      const alertItem = { ...data, receivedAt: new Date(), type: data.alertType || data.type || 'NO_PARKING' };
      setLiveAlert(alertItem);
      setRecentAlerts(prev => [alertItem, ...prev].slice(0, 30));
    });

    // Listen for critical accident/SOS alerts
    newSocket.on('alert:emergency', (data) => {
      console.log('Real-time emergency SOS:', data);
      const alertItem = { ...data, receivedAt: new Date(), type: 'ACCIDENT' };
      setLiveAlert(alertItem);
      setRecentAlerts(prev => [alertItem, ...prev].slice(0, 30));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Whenever user changes, join their room
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join_user_room', user._id);
    }
  }, [socket, user]);

  const joinTagRoom = (tagCode) => {
    if (socket && tagCode) {
      socket.emit('join_tag_room', tagCode.toUpperCase());
    }
  };

  const dismissAlert = () => {
    setLiveAlert(null);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      liveAlert,
      recentAlerts,
      joinTagRoom,
      dismissAlert
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
