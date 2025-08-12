import { useContext, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../contexts/appContext';
import socketIOClient from 'socket.io-client';

type ProtectedContentProps = {
    children: ReactNode;
};

export const ProtectedContent = ({ children }: ProtectedContentProps) => {
  const appContext = useContext(AppContext);
  
  if(!appContext.appState.accessToken) {
    //TODO clean appState
    appContext.setAppState({accessToken: '', user: null});
    localStorage.removeItem('userInfos');
    return <Navigate to="/login" ></Navigate>
  }

  const socket = socketIOClient('https://oldschoolgames-backend.codevert.org/events', {
		extraHeaders: { Authorization: `Bearer ${appContext.appState.accessToken}` }
	});

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });
  socket.on('error', (error: {error: string, message: string, code: number}) => {
    console.error('WebSocket error:', error);
    localStorage.removeItem('userInfos');
    localStorage.removeItem('accessToken');
    appContext.setAppState({accessToken: '', user: null});
  });

  return <div>{children}</div>
}
