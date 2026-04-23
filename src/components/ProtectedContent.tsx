import { useContext, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../contexts';

type ProtectedContentProps = Readonly<{
    children: ReactNode;
}>;

export const ProtectedContent = ({ children }: ProtectedContentProps) => {
  const appContext = useContext(AppContext);

  if(!appContext.appState.accessToken) {
    return <Navigate to="/login" ></Navigate>
  }

  return <>{children}</>
}
