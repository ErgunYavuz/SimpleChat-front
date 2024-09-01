import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  width: 100vh;  // Make width equal to viewport height
  height: 100vh; // Maximize height
  max-width: 100vw; // Prevent overflow on narrow screens
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 25%;
  background-color: ${props => props.theme.sidebar};
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ChatArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 75%;
`;

const MessageList = styled.div`
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse; // This makes new messages appear at the bottom
`;

const MessageItem = styled.div<{ isSelf: boolean }>`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: ${props => props.isSelf ? props.theme.buttonBackground : props.theme.messageBackground};
  color: ${props => props.isSelf ? props.theme.buttonText : props.theme.text};
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
  align-self: ${props => props.isSelf ? 'flex-end' : 'flex-start'};
`;

const MessageHeader = styled.span`
  font-weight: bold;
`;

const MessageTime = styled.span`
  color: ${props => props.theme.text};
  opacity: 0.7;
  font-size: 0.8em;
  margin-left: 0.5rem;
`;

const InputArea = styled.form`
  display: flex;
  padding: 1rem;
  background-color: ${props => props.theme.background};
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.input};
  border-radius: 20px;
  font-size: 1rem;
  background-color: ${props => props.theme.input};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  background-color: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const LogoutButton = styled(Button)`
  margin-top: auto; // Push to bottom of sidebar
`;

interface Message {
  type?: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  username: string;
  socket: WebSocket | null;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ username, socket, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'USER_LIST' && Array.isArray(data.users)) {
            setOnlineUsers(data.users);
          } else if (data.sender && data.content && data.timestamp) {
            setMessages((prevMessages) => [data, ...prevMessages]);
          } else {
            console.warn('Received message in unexpected format:', data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    }
  }, [socket]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && inputMessage.trim()) {
      const message = {
        type: 'CHAT',
        sender: username,
        content: inputMessage,
        timestamp: new Date().toISOString(),
      };
      socket.send(JSON.stringify(message));
      setInputMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChatContainer>
      <Sidebar>
        <h3>Online Users ({onlineUsers.length})</h3>
        {onlineUsers.map((user, index) => (
          <div key={index}>{user}</div>
        ))}
        <LogoutButton onClick={onLogout}>Logout</LogoutButton>
      </Sidebar>
      <ChatArea>
        <MessageList ref={messageListRef}>
          {messages.map((message, index) => (
            <MessageItem key={index} isSelf={message.sender === username}>
              <MessageHeader>
                {message.sender}
                <MessageTime>{formatTimestamp(message.timestamp)}</MessageTime>
              </MessageHeader>
              <div>{message.content}</div>
            </MessageItem>
          ))}
        </MessageList>
        <InputArea onSubmit={sendMessage}>
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit">Send</Button>
        </InputArea>
      </ChatArea>
    </ChatContainer>
  );
};

export default ChatInterface;