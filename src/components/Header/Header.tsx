import { useContext, useEffect, useRef } from 'react';
import './Header.css'
import { Link } from "react-router-dom";
import { AppContext } from '../../contexts/appContext';
import { Box } from '../Box/Box';

export function Header() {
  useEffect(() => {
    const documentElement = document.querySelector('html');
    
    if (menu.current && documentElement) {
      document.addEventListener('click', (e) => {
        if (menu.current !== null && !(menu.current.contains(e.target as Node))) {
          menu.current!.classList.remove("expanded");
        }
      });
    }
    return () => {
      documentElement!.removeEventListener('click', () => {});
      
    };
  })
  const menu = useRef<HTMLDivElement>(null);
  
  const appContext = useContext(AppContext);
  const logOut = () => {
    localStorage.clear();
    appContext.setAppState({accessToken: '', user: null});
  }


  const collapseMenu = () => {
    if(menu.current) {
      menu.current.classList.remove("expanded");
    }
  }
  const toggleMenu = () => {
    if(menu.current) {
      menu.current.classList.toggle("expanded");
    }
  }
  return (
    <header>
      <h1><Link to='/'>OldSchoolGames</Link></h1>
      {appContext.appState.user &&
        <div className='logthumb' ref={menu}>
          <div className="logLabel" onClick={toggleMenu}>
            {appContext.appState.user.avatarUrl && 
              <img className="logAvatar" src={`${import.meta.env.VITE_BACKEND_URL}/assets/user_avatars/${appContext.appState.user.avatarUrl}`} />
            }
            <span>{appContext.appState.user.pseudo}</span>
            <img src="/turn-off.png" alt="logout" onClick={logOut}/>
          </div>
          <Box className="logMenu" >
            <div className="menuItem" onClick={collapseMenu}>
              <Link to='/profile'>
                Profile
              </Link>
            </div>
            <div className="menuItem"  onClick={collapseMenu}>
              <span>
                Déconnexion
              </span>
            </div>
          </Box>
          
          
        </div>
      }
      
    </header>
  )
}