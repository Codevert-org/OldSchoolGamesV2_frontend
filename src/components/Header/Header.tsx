import { useContext } from 'react';
import './Header.css'
import { Link } from "react-router-dom";
import { AppContext } from '../../contexts/appContext';
import { Box } from '../Box/Box';

export function Header() {
  const appContext = useContext(AppContext);
  const logOut = () => {
    localStorage.clear();
    appContext.setAppState({accessToken: '', user: null});
  }
  const expandMenu = () => {
    console.log('triggered');
    const menu = document.querySelector('.logthumb');
    if(menu) {
      menu.classList.toggle("expanded");
    }
  }
  return (
    <header>
      <h1><Link to='/'>OldSchoolGames</Link></h1>
      {appContext.appState.user &&
        <div className='logthumb'>
          <div className="logLabel" onClick={expandMenu}>
            {appContext.appState.user.avatarUrl && 
              <img className="logAvatar" src={`${import.meta.env.VITE_BACKEND_URL}/assets/user_avatars/${appContext.appState.user.avatarUrl}`} />
            }
            <span>{appContext.appState.user.pseudo}</span>
            <img src="/turn-off.png" alt="logout" onClick={logOut}/>
          </div>
          <Box className="logMenu">
            <div className="menuItem">
              <span>
                Profile
              </span>
            </div>
            <div className="menuItem">
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