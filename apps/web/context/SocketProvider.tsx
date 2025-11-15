"use client"
import React, { useCallback,useContext,useEffect, useState } from 'react'
import {io, Socket} from 'socket.io-client';
interface socketProviderProps {
  children?: React.ReactNode;
}
interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: string[];
}
const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if(!state) throw new Error(`State is undefined.`)
    return state;
}

export const SocketProvider = ({children}: socketProviderProps) => {

  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => { 
    const _socket = io('http://localhost:8000');
    _socket.on("message", onMessageReceived)
    setSocket(_socket)
    return () => {
      _socket.disconnect();
      _socket.off('message', onMessageReceived)
      setSocket(undefined)
  };
  }, [])

  const sendMessage: ISocketContext['sendMessage'] = useCallback((msg) => {
    if(socket) {
      socket.emit('event:message', {message: msg})
    }
    console.log('Send Message', msg);
  },[socket]);
  
  const onMessageReceived = useCallback((msg: string) => {
    console.log("From Server message received", msg)
    const {message} = JSON.parse(msg) as {message: string};
    setMessages((prev) => [...prev, message])
  }, []);
  return (
    <SocketContext.Provider value={{sendMessage, messages}}>
      {children}
    </SocketContext.Provider>
  )
}