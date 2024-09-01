import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import LoginScreen from './LoginScreen';
import ChatInterface from './ChatInterface';

// Define theme types
type Theme = {
  background: string;
  text: string;
  input: string;
  sidebar: string;
  messageBackground: string;
  buttonBackground: string;
  buttonText: string;
};

const lightTheme: Theme = {
  background: '#ffffff',
  text: '#000000',
  input: '#f0f2f5',
  sidebar: '#f0f2f5',
  messageBackground: '#e5e5ea',
  buttonBackground: '#1877f2',
  buttonText: '#ffffff',
};

const darkTheme: Theme = {
  background: '#36393f',
  text: '#dcddde',
  input: '#40444b',
  sidebar: '#2f3136',
  messageBackground: '#40444b',
  buttonBackground: '#7289da',
  buttonText: '#ffffff',
};

const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
  }
`;

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const ThemeToggle = styled.button<{ theme: Theme }>`
  position: fixed;
  top: 10px;
  right: 10px;
  background-color: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
`;


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (username) {
        const newSocket = new WebSocket('ws://localhost:8080/chat');
        
        newSocket.onopen = () => {
          console.log('WebSocket Connected');
          newSocket.send(JSON.stringify({ type: 'LOGIN', sender: username }));
        };
  
        newSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'ERROR') {
            setLoginError(data.message);
            setIsLoggedIn(false);
            setUsername('');
            newSocket.close();
          } else if (data.type === 'CHAT' && data.sender === 'System' && data.content.startsWith('Welcome')) {
            setIsLoggedIn(true);
            setLoginError(null);
          }
        };
  
        newSocket.onerror = (error) => {
          console.error('WebSocket Error:', error);
          setLoginError('Failed to connect to the chat server.');
        };
  
        newSocket.onclose = () => {
          console.log('WebSocket Disconnected');
          setIsLoggedIn(false);
        };
  
        setSocket(newSocket);
  
        return () => {
          newSocket.close();
        };
      }  
    }, [username]);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    setIsLoggedIn(false);
    setUsername('');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />
      <AppContainer>
        {isLoggedIn ? (
          <ChatInterface username={username} socket={socket} onLogout={handleLogout} />
        ) : (
          <LoginScreen onLogin={handleLogin} error={loginError} />
        )}
        <ThemeToggle onClick={toggleTheme} theme={theme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;