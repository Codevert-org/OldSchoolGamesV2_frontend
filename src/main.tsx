import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppProvider from './providers/AppProvider.tsx';
import WsProvider from './providers/WsProvider.tsx';
import { Login, Home, Dashboard, Profile, Morpion, Puissance4 } from './pages';
import { ProtectedContent } from './components';
// TODO create index for pages

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
          <Route path="puissance4" element={ <Puissance4 />} />
        </Route>
        <Route path="/login" element={ <Login /> } />
      </Routes>
    </Router>
  </AppProvider>
);
