import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppProvider from './providers/AppProvider.tsx';
import WsProvider from './providers/WsProvider.tsx';
import { Login } from './pages/Login/Login.tsx';
import { Home } from './pages/Home/Home.tsx';
import { Dashboard } from './pages/Dashboard/Dashboard.tsx';
import { Profile } from './pages/Profile/Profile.tsx';
import { Morpion } from './pages/Game/Morpion/Morpion.tsx';
import { ProtectedContent } from './components';

import './index.css';

createRoot(document.getElementById('root')!).render(
  < AppProvider>
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedContent>
            <WsProvider>
              <Home /> 
            </WsProvider>
          </ProtectedContent> 
        } >
          <Route path="/" element={ <Dashboard /> } />
          <Route path="profile" element={ <Profile />} />
          <Route path="morpion" element={ <Morpion />} />
        </Route>
        <Route path="/login" element={ <Login /> } />
      </Routes>
    </Router>
  </AppProvider>
);
