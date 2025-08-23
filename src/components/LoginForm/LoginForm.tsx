import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '../Switch/Switch';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
import { useContext } from 'react';
import { AppContext } from '../../contexts/appContext';
import { CropperModal } from '../CropperModal/CropperModal';
import './loginForm.css'
import { fetchAuth } from '../../services/auth.service';
import type { IAuthResponse } from '../../interfaces/IauthResponse';
import { FormLine } from '../FormLine/FormLine';
import type { IApiError } from '../../interfaces/IApiError';

export function LoginForm() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const [firstIsActive, setfirstIsActive] = useState(true);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const formRef = useRef(null);
  const errorRef = useRef(null);
  const switchIndex = () => {
    setfirstIsActive(!firstIsActive)
  }
  
  const extension: {[index: string]:string} = {
		'image/gif': 'gif',
    'image/png': 'png',
		'image/jpeg': 'jpg'
	};

  const handleLogin = async (formData: FormData) => {
    //TODO form error handling
    const json = {
      email: formData.get('email'),
      password: formData.get('password')
    }
    await handleFetch('login', JSON.stringify(json));
  }

  const handleRegister = async (formData : FormData) => {
    //TODO form error handling
    if(croppedImage) {
      await setAvatar(formData);
    }
    await handleFetch('register', formData);
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

  async function handleFetch(endpoint: 'login' | 'register', body: string | FormData) {
    if(errorRef.current) {
      const errorElt: HTMLElement = errorRef.current;
      errorElt.innerHTML = '';
    }
    try {
      const response: IAuthResponse = await fetchAuth(endpoint, body);
      //? handle response type
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userInfos', JSON.stringify(response.user));
      appContext.setAppState({ accessToken: response.accessToken, user: response.user });
      navigate('/');
    }
    catch (e) {
      console.log(e);
      const error = e as IApiError;
      if(errorRef.current) {
        const errorElt: HTMLElement = errorRef.current;
        errorElt.innerHTML = error.message;
      }
    }
  }

  return (
    <>
    <CropperModal 
      setImage={setCroppedImage}
      croppedImage={croppedImage}
      showModal={isOpen}
      setShowModal={setIsOpen}
    />
    <div className='login-page'>
      <Switch
        labels={['login', 'register']}
        switchIndex={switchIndex}
        firstIsActive={firstIsActive}
      />
      <Box className={`loginForm${firstIsActive ? '' : ' expanded'}`}>
        <form ref={formRef} action={firstIsActive ? handleLogin : handleRegister}>
            {
            /**
             *  TODO : Make it a controlled input
             ** and, in the handleChange, try to make an API call to check if pseudo is un use
             *! Debounce it !
             */}
          <div className="expandable">
            <FormLine name='pseudo' required={!firstIsActive} />
          </div>
          <FormLine name='email' inputType='email' required />
          <FormLine name='password' inputType='password' label='Mot de passe:' required />
          <div className='expandable'>
            <FormLine name='passwordConfirm' inputType='password' label='Confirmez:' required={!firstIsActive} />
          </div>
          <div className='expandable'>
            <div>
              <Button callback={() => (setIsOpen(true))} label="avatar" />
              {croppedImage && 
                <div><img src={croppedImage} alt="Cropped profile" className="avatar-preview" /></div>
              }
            </div>
          </div>
          <Button type='submit' label="Valider"/>
        </form>
      </Box>
      <div className="error-message" ref={errorRef}>

      </div>
    </div>
    </>
  )

  
}