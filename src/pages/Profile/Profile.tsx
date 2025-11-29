import './Profile.css';
import { useContext, useRef, useState } from "react"
import { AppContext } from "../../contexts"
import { Box, Button, CropperModal, FormLine } from "../../components";
import { fetchUpdateUser } from '../../services/users.service';
import type { IUserResponse } from '../../interfaces/IUserResponse';
import { extension } from '../../utils/constants/extensions';

export function Profile() {
  const appContext = useContext(AppContext);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [iscropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState<boolean>(false);
  const formRef = useRef(null);
  const user = appContext.appState.user;

  const handleSubmit = async (formData: FormData) => {
    
    if(!isPasswordChangeOpen) {
      formData.delete('oldPassword');
      formData.delete('newPassword');
      formData.delete('newPasswordConfirm');
    }

    async function setAvatar(formData: FormData) {
      const blob = await fetch(croppedImage).then((r) => r.blob());
      const mimeType = croppedImage.substring(
        croppedImage.indexOf(':') + 1,
        croppedImage.indexOf(';')
      );
      const file = new File([blob], `avatar.${extension[mimeType]}`, {
        type: mimeType || 'image/png'
      });
      formData.set('avatar', file);
    }

    if(croppedImage) {
      await setAvatar(formData)
    }

    try {
      const response: IUserResponse = await fetchUpdateUser(formData);
      appContext.setAppState((previousState) => ({
        ...previousState,
        user: {
          ...previousState.user!,
          avatarUrl: null
        }
      }))
      appContext.setAppState((previousState) => ({
        ...previousState,
        user: {
          ...previousState.user!,
          pseudo: response.pseudo,
          avatarUrl: response.avatarUrl
        }
      }))
      // TODO : clean avatar Cropper
      setCroppedImage('');
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <>
    <CropperModal 
      setImage={setCroppedImage}
      croppedImage={croppedImage}
      showModal={iscropperOpen}
      setShowModal={setIsCropperOpen}
    />
    <div className='profile-page'>
      <h1>profil</h1>
      <Box>
        <form ref={formRef} action={handleSubmit} className={isPasswordChangeOpen ? 'expanded' : ''}>
          <FormLine name="pseudo" value={user?.pseudo}/>
          <label htmlFor='changePassword'>Changement de mot de passe ?</label><input type='checkbox' id='changePassword' className='changePassword' onChange={(e) => setIsPasswordChangeOpen(e.target.checked)} />
          <div className="expandable">
            <FormLine name="oldPassword" inputType='password' label="Mot de passe actuel" required={isPasswordChangeOpen} />
            <FormLine name='newPassword' inputType='password' label='Nouveau mot de passe' required={isPasswordChangeOpen} />
            <FormLine name='newPasswordConfirm' inputType='password' label='Confirmez' required={isPasswordChangeOpen} />
          </div>
          <div>
            <Button label="avatar" callback={() => setIsCropperOpen(true)} />
              <div className="avatar-preview">
                {user?.avatarUrl &&
                  <img className="actualAvatar" alt="actual avatar" src={`${import.meta.env.VITE_BACKEND_URL}/assets/user_avatars/${user?.avatarUrl}`} />
                }
                {user?.avatarUrl && croppedImage &&
                  <span className='avatarChange'>{"=>"}</span>
                }
                {croppedImage &&
                  <img className='newAvatar' alt='new avatar' src={croppedImage} />
                }
              </div>
          </div>
          <Button type='submit' label="Valider"/>
        </form>
      </Box>
    </div>
    </>
  )
}
