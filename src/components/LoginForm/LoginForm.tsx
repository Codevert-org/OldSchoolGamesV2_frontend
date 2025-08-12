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

export function LoginForm() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const [firstIsActive, setfirstIsActive] = useState(true);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const formRef = useRef(null);
  const switchIndex = () => {
    setfirstIsActive(!firstIsActive)
  }
  
  const extension: {[index: string]:string} = {
		'image/gif': 'gif',
    'image/png': 'png',
		'image/jpeg': 'jpg'
	};

  const handleSubmit = async (formData : FormData) => {
    
    //? convert to json ( no image to process )
    //? remove register fields ( they'll be present for animation purpose )
    if(firstIsActive) {
      formData.delete("pseudo");
      formData.delete("passwordConfirm");
      formData.delete("avatar");
    }
    const json = JSON.stringify(Object.fromEntries(formData));

    if(!firstIsActive && croppedImage) {
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

    //TODO form error handling

    const endpoint = firstIsActive ? 'login' : 'register';
    const body = firstIsActive ? json : formData;
    let response: {accessToken: string, user: {id: number, pseudo: string, avatarUrl: string | null}};

    try {
      response = await fetchAuth(endpoint, body);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userInfos', JSON.stringify(response.user));
      appContext.setAppState({accessToken: response.accessToken, user: response.user});
      navigate('/');
    }
    catch (e) {
      console.log(e);
    }
    
  }

  return (
    <>
    <CropperModal setImage={setCroppedImage} croppedImage={croppedImage} showModal={isOpen} setShowModal={setIsOpen} />
    <div className='login-page'>
      <Switch
        labels={['login', 'register']}
        switchIndex={switchIndex}
        firstIsActive={firstIsActive}
      />
      <Box>
        {/* <form ref={formRef} action={handleSubmit}> */}
        <form ref={formRef}  action={handleSubmit}>
          {!firstIsActive && 
            /**
             * TODO : Make it a controlled input
             * and, in the handleChange, try to make an API call to check if pseudo is un use
             * ! Debounce it !
             */
            <div
              className="form-line"
            >
              <div><label htmlFor="username">Pseudo:</label></div>
              <input type="text" id="username" name="pseudo" required />
            </div>
          }
          <div className="form-line">
            <div><label htmlFor="email">Email:</label></div>
            <input type="text" id="email" name="email" required />
          </div>
          <div className="form-line">
            <div><label htmlFor="password">Mot de passe:</label></div>
            <input type="password" id="password" name="password" required />
          </div>
          {!firstIsActive && 
            <>
              <div
                className={`form-line ${!firstIsActive ? 'animated' : ''}`}
              >
                <div><label htmlFor="passwordConfirm">Confirmez:</label></div>
                <input type="password" id="passwordConfirm" name="passwordConfirm" required />
              </div>
              <div>
                <Button callback={() => (setIsOpen(true))} label="avatar" />
              </div>
              {croppedImage && 
                <>
                  <img src={croppedImage} alt="Cropped profile" className="avatar-preview" />
                </>
              }
            </>
          }
          <Button type='submit' label="Valider"/>
        </form>
      </Box>
    </div>
    </>
  )
}