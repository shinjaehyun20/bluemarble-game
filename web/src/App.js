import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const SOCKET_SERVER_URL = 'http://localhost:4000';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server!');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server.');
      setIsConnected(false);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blue Marble Game</h1>
        <p>Server Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      </header>
    </div>
  );
}

export default App;
