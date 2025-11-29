import { useContext, useState} from "react";
import React from "react";
import type { IUser } from "../../interfaces/events/IUsers";
import WsContext from "../../contexts/wsContext";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import "./UserItem.scss";
import { Box } from "../Box/Box";

export function UserItem({user}: {user: IUser}) {
  const wsContext = useContext(WsContext);
  const socket = wsContext?.Socket;
  const [isInviteSentOpen, setIsInviteSentOpen] = useState(false);
  const [isInviteReceivedOpen, setIsInviteReceivedOpen] = useState(false);
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleInviteClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if(!user.invite) {
      // TODO switch to chooseGame when implemented
      setIsGameSelectionOpen(true);
    }
    if(user.invite === 'to') {
      setIsInviteSentOpen(true);
    }
    if(user.invite === 'from') {
      setIsInviteReceivedOpen(true);
    }
  }

  const sendInvite = (game: string = "morpion") => {
    // TODO: close game selection menu
    // setIsGameSelectionOpen(false);
    setIsGameSelectionOpen(false);
    if (socket) {
      socket.emit("invitation", {
        eventType: "sent",
        toId: user.id,
        game,
      });
    }
  }

  const cancelInvite = () => {
    if (socket && user.invitationId) {
      socket.emit("invitation", {
        eventType: "canceled",
        invitationId: user.invitationId,
      })
    }
    setIsInviteSentOpen(false);
    setIsInviteReceivedOpen(false);
    setAnchorEl(null);
  }

  const acceptInvite = () => {
    console.log("Invitation accepted !");
    if (socket && user.invitationId) {
      socket.emit("invitation", {
        eventType: "accepted",
        invitationId: user.invitationId
      })
    }
    setIsInviteReceivedOpen(false);
    setAnchorEl(null);
  }

  return (
    <>
    <div
      className="userItem"
      onClick={handleInviteClick}
    >
      <img
        src={user.avatarUrl ? `${import.meta.env.VITE_BACKEND_URL}/assets/user_avatars/${user.avatarUrl}` : '/defaultavatar.webp'}
        alt="avatar"
        className="userItem-avatar" />
      <span className="userItem-pseudo">{user.pseudo}</span>
      {user.invite === 'to' &&
        <div className="invite-sent" >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 63.5" className="sand-clock">
            <path d="M1.27,8.39H4.89A32.64,32.64,0,0,0,8.51,22.57C10.9,27,14.18,30.27,18,31.9a1.29,1.29,0,0,0,.51.1,1.26,1.26,0,0,0,1.16-.75A1.23,1.23,0,0,0,19,29.61C12.46,26.83,7.81,18.2,7.44,8.39H45.73A1.26,1.26,0,0,0,47,7.14V1.25A1.26,1.26,0,0,0,45.73,0H1.27A1.26,1.26,0,0,0,0,1.25V7.14A1.26,1.26,0,0,0,1.27,8.39Zm1.28-5.9h41.9V5.9H2.55Z"/>
            <path d="M45.73,54.83H42.11a34.43,34.43,0,0,0-3.62-14.64,21.68,21.68,0,0,0-7.31-8.46A20.9,20.9,0,0,0,37.53,25a32.65,32.65,0,0,0,4.33-13,1.27,1.27,0,1,0-2.53-.31C38.26,20.57,33.8,28,28,30.55a1.29,1.29,0,0,0-.77,1.18A1.27,1.27,0,0,0,28,32.91C34.54,35.79,39.2,44.7,39.56,54.83H7.44c.27-7.58,2.91-14.55,7.18-18.83a1.28,1.28,0,0,0,0-1.81,1.26,1.26,0,0,0-1.8,0C8.09,38.92,5.17,46.57,4.89,54.83H1.27A1.28,1.28,0,0,0,0,56.12v6.09A1.28,1.28,0,0,0,1.27,63.5H45.73A1.28,1.28,0,0,0,47,62.21V56.12A1.28,1.28,0,0,0,45.73,54.83Zm-1.28,6.1H2.55V57.41h41.9Z"/>
            <path className="sand-top" d="M34.94,12.82a1.28,1.28,0,0,0-1-.5H12.51a1.27,1.27,0,0,0-1,.5,1.29,1.29,0,0,0-.24,1.12,24.16,24.16,0,0,0,4.34,9.22c2.2,2.72,4.84,4.16,7.62,4.16s5.42-1.44,7.63-4.16a24.15,24.15,0,0,0,4.33-9.22A1.32,1.32,0,0,0,34.94,12.82ZM23.21,24.72c-4.1,0-7.34-4.7-9-9.8h18C30.55,20,27.31,24.72,23.21,24.72Z"/>
            <path className="sand-bottom" d="M34.94,49.82a1.31,1.31,0,0,1-1,.5H12.51a1.31,1.31,0,0,1-1.26-1.62,24.16,24.16,0,0,1,4.34-9.22c2.2-2.72,4.84-4.16,7.62-4.16s5.42,1.44,7.63,4.16a24.15,24.15,0,0,1,4.33,9.22A1.32,1.32,0,0,1,34.94,49.82ZM23.21,37.92c-4.1,0-7.34,4.7-9,9.8h18C30.55,42.62,27.31,37.92,23.21,37.92Z"/>
          </svg>
        </div>}
      {user.invite === 'from' &&
        <div className="invite-received" >
          <img src="/coucou.gif" alt="invitation received"/>
        </div>}
    </div>
    {/* Invite sent menu */}
    <Menu
      anchorEl={anchorEl}
      open={isInviteSentOpen}
      onClose={() => setIsInviteSentOpen(false)}
      anchorOrigin={{
        vertical: -10,
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#131410',
          color: '#4a8b53',
          borderRadius: '12px',
          overflow: 'visible',
        },
        '& .MuiList-root': {
          padding: 0,
        },
        '& .box': {
          margin: 0
        }
      }}
    >
      <Box>
        <MenuItem onClick={cancelInvite} >❌ Annuler</MenuItem>
      </Box>
      
    </Menu>
    {/* Invite received menu */}
    <Menu
      anchorEl={anchorEl}
      open={isInviteReceivedOpen}
      onClose={() => setIsInviteReceivedOpen(false)}
      anchorOrigin={{
        vertical: -10,
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#131410',
          color: '#4a8b53',
          borderRadius: '12px',
          overflow: 'visible',
        },
        '& .MuiList-root': {
          padding: 0,
        },
        '& .box': {
          margin: 0
        }
      }}
    >
      <Box>
        <MenuItem onClick={cancelInvite} >❌ Refuser</MenuItem>
        <MenuItem onClick={acceptInvite}>✅ Accepter</MenuItem>
      </Box>
    </Menu>
    {/* Invite received menu */}
    <Menu
      anchorEl={anchorEl}
      open={isGameSelectionOpen}
      onClose={() => setIsGameSelectionOpen(false)}
      anchorOrigin={{
        vertical: -10,
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#131410',
          color: '#4a8b53',
          borderRadius: '12px',
          overflow: 'visible',
        },
        '& .MuiList-root': {
          padding: 0,
        },
        '& .box': {
          margin: 0
        }
      }}
    >
      <Box>
        <MenuItem onClick={() => {sendInvite("morpion")}} >Morpion</MenuItem>
        <MenuItem onClick={() => {sendInvite("puissance4")}}>Puissance 4</MenuItem>
      </Box>
    </Menu>
    </>
  )
}