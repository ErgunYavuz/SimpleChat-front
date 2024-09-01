import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  background-color: ${props => props.theme.sidebar};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.input};
  border-radius: 6px;
  font-size: 1rem;
  background-color: ${props => props.theme.input};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  background-color: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

interface LoginScreenProps {
  onLogin: (username: string) => void;
  error: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const validateUsername = (name: string): boolean => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      setLocalError('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
    } else {
      setLocalError('');
      onLogin(username);
    }
  };

  return (
    <LoginContainer>
      <Title>Chat Login</Title>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {(localError || error) && <ErrorMessage>{localError || error}</ErrorMessage>}
        <Button type="submit">Join Chat</Button>
      </form>
    </LoginContainer>
  );
};

export default LoginScreen;