import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.tsx'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from './pages/Login/Login.tsx';
import AppProvider from './providers/AppProvider.tsx';
import { Home } from './pages/Home.tsx';
import { ProtectedContent } from './components/ProtectedContent.tsx';
import { Dashboard } from './pages/Dashboard/Dashboard.tsx';
import { Profile } from './pages/Profile/Profile.tsx';

createRoot(document.getElementById('root')!).render(
  < AppProvider>
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedContent>
            <Home /> 
          </ProtectedContent> 
        } >
          <Route path="/" element={ <Dashboard /> } />
          <Route path="profile" element={ <Profile />} />
        </Route>
          
        
        <Route path="/login" element={ <Login /> } />
      </Routes>
    </Router>
  </AppProvider>
);
