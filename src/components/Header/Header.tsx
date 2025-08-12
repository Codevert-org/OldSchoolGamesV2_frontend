import { useContext } from 'react';
import './Header.css'
import { Link } from "react-router-dom";
import { AppContext } from '../../contexts/appContext';

export function Header() {
  const appContext = useContext(AppContext);
  const logOut = () => {
    localStorage.clear();
    appContext.setAppState({accessToken: '', user: null});
  }
  return (
    <header>
      <h1><Link to='/'>OldSchoolGames</Link></h1>
      {appContext.appState.user &&
        <div className='logthumb'>
          {appContext.appState.user.pseudo}
          <img src="/turn-off.png" alt="logout" onClick={logOut}/>
        </div>
      }
      
    </header>
  )
}