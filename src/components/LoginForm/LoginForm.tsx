import { useRef, useState, useEffect, useCallback, useContext, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '../Switch/Switch';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
import { AppContext } from '../../contexts';
import { CropperModal } from '../CropperModal/CropperModal';
import './loginForm.css';
import { fetchAuth } from '../../services/auth.service';
import { checkPseudoAvailable } from '../../services/users.service';
import type { IAuthResponse } from '../../interfaces/IauthResponse';
import { FormLine } from '../FormLine/FormLine';
import type { IApiError } from '../../interfaces/IApiError';

const PASSWORD_RULES = [
  { label: 'Au moins 1 chiffre', test: (v: string) => /\d/.test(v) },
  { label: 'Au moins 1 majuscule', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Au moins 1 minuscule', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Au moins 1 caractère spécial', test: (v: string) => /[^a-zA-Z0-9\s]/.test(v) },
  { label: '8 à 16 caractères, sans espace', test: (v: string) => /^[^\s]{8,16}$/.test(v) },
];

const extension: { [index: string]: string } = {
  'image/gif': 'gif',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

export function LoginForm() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const [firstIsActive, setfirstIsActive] = useState(true);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const formRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [avatarWarning, setAvatarWarning] = useState<string>('');

  // Champs contrôlés — register uniquement
  const [pseudo, setPseudo] = useState('');
  const [pseudoStatus, setPseudoStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const switchIndex = () => {
    setfirstIsActive(!firstIsActive);
  };

  // Debounce check-pseudo : 1s après le dernier changement
  const handlePseudoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPseudo(value);
    setPseudoStatus('idle');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) return;
    setPseudoStatus('checking');
    debounceRef.current = setTimeout(async () => {
      const available = await checkPseudoAvailable(value);
      setPseudoStatus(available ? 'available' : 'taken');
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const passwordRulesValid = PASSWORD_RULES.every((r) => r.test(password));
  const passwordConfirmValid = password === passwordConfirm && passwordConfirm.length > 0;
  const registerFormValid =
    pseudo.length >= 2 &&
    pseudoStatus === 'available' &&
    passwordRulesValid &&
    passwordConfirmValid;

  async function setAvatar(formData: FormData) {
    const blob = await fetch(croppedImage).then((r) => r.blob());
    const mimeType = croppedImage.substring(
      croppedImage.indexOf(':') + 1,
      croppedImage.indexOf(';'),
    );
    const file = new File([blob], `avatar.${extension[mimeType]}`, {
      type: mimeType || 'image/png',
    });
    formData.set('avatar', file);
  }

  async function handleFetch(endpoint: 'login' | 'register', body: string | FormData) {
    setErrorMessage('');
    setAvatarWarning('');
    try {
      const response: IAuthResponse = await fetchAuth(endpoint, body);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userInfos', JSON.stringify(response.user));
      appContext.setAppState({ accessToken: response.accessToken, user: response.user });
      if (response.avatarMessage) {
        setAvatarWarning(response.avatarMessage);
        return;
      }
      navigate('/');
    } catch (e) {
      console.log(e);
      const error = e as IApiError;
      setErrorMessage(error.message);
    }
  }

  const handleLogin = async (formData: FormData) => {
    const json = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    await handleFetch('login', JSON.stringify(json));
  };

  const handleRegister = async (formData: FormData) => {
    if (croppedImage) {
      await setAvatar(formData);
    }
    await handleFetch('register', formData);
  };

  return (
    <>
      <CropperModal
        setImage={setCroppedImage}
        croppedImage={croppedImage}
        showModal={isOpen}
        setShowModal={setIsOpen}
      />
      <div className="login-page">
        <Switch
          labels={['login', 'register']}
          switchIndex={switchIndex}
          firstIsActive={firstIsActive}
        />
        <Box className={`loginForm${firstIsActive ? '' : ' expanded'}`}>
          <form ref={formRef} action={firstIsActive ? handleLogin : handleRegister}>
            {/* Pseudo — register uniquement */}
            <div className="expandable">
              <div>
                <FormLine
                  name="pseudo"
                  required={!firstIsActive}
                  value={pseudo}
                  onChange={handlePseudoChange}
                />
                {pseudo.length >= 2 && (
                  <div className={`pseudo-status pseudo-status--${pseudoStatus}`}>
                    {pseudoStatus === 'checking' && 'Vérification…'}
                    {pseudoStatus === 'available' && '✓ Disponible'}
                    {pseudoStatus === 'taken' && '✗ Déjà utilisé'}
                  </div>
                )}
              </div>
            </div>
            <FormLine name="email" inputType="email" required />
            {/* Password — contrôlé en register, libre en login */}
            <FormLine
              name="password"
              inputType="password"
              label="Mot de passe:"
              required
              value={firstIsActive ? undefined : password}
              onChange={firstIsActive ? undefined : (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {!firstIsActive && password.length > 0 && (
              <ul className="password-rules">
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule.label} className={rule.test(password) ? 'rule-ok' : 'rule-ko'}>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
            {/* PasswordConfirm — register uniquement */}
            <div className="expandable">
              <div>
                <FormLine
                  name="passwordConfirm"
                  inputType="password"
                  label="Confirmez:"
                  required={!firstIsActive}
                  value={passwordConfirm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(e.target.value)}
                />
                {passwordConfirm.length > 0 && (
                  <div className={`pseudo-status pseudo-status--${passwordConfirmValid ? 'available' : 'taken'}`}>
                    {passwordConfirmValid ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                  </div>
                )}
              </div>
            </div>
            <div className="expandable">
              <div>
                <Button callback={() => setIsOpen(true)} label="avatar" />
                {croppedImage && (
                  <div className="avatar-preview-container">
                    <img src={croppedImage} alt="Cropped profile" className="avatar-preview" />
                  </div>
                )}
              </div>
            </div>
            <Button
              type="submit"
              label="Valider"
              disabled={!firstIsActive && !registerFormValid}
            />
          </form>
        </Box>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {avatarWarning && (
          <div className="avatar-warning">
            <p>{avatarWarning}</p>
            <Button type="button" label="Continuer" callback={() => navigate('/')} />
          </div>
        )}
      </div>
    </>
  );
}
