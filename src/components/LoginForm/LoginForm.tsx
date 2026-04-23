import { useRef, useState, useContext, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '../Switch/Switch';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
import { AppContext } from '../../contexts';
import { CropperModal } from '../CropperModal/CropperModal';
import './loginForm.css';
import '../../assets/icons/icons.css';
import { fetchAuth } from '../../services/auth.service';
import { checkPseudoAvailable } from '../../services/users.service';
import type { IAuthResponse } from '../../interfaces/IauthResponse';
import { FormLine } from '../FormLine/FormLine';
import type { IApiError } from '../../interfaces/IApiError';
import { validatePassword, createPseudoChecker } from '../../utils/validation';
import ValidIcon from '../../assets/icons/ValidIcon';
import InvalidIcon from '../../assets/icons/InvalidIcon';

const extension: { [index: string]: string } = {
  'image/gif': 'gif',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

const PASSWORD_CRITERIA = [
  { key: 'length',    label: '8–16 characters' },
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'digit',     label: 'Number' },
  { key: 'special',   label: 'Special character' },
] as const;

type ErrorState = { text: string; phase: 'visible' | 'exiting' } | null;

function useFieldError() {
  const [error, setError] = useState<ErrorState>(null);

  const show = (text: string) => setError({ text, phase: 'visible' });

  const dismiss = () => {
    setError((prev) => prev ? { ...prev, phase: 'exiting' } : null);
  };

  const clear = () => setError(null);

  return { error, show, dismiss, clear };
}

export function LoginForm() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const [firstIsActive, setfirstIsActive] = useState(true);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [avatarWarning, setAvatarWarning] = useState<string>('');

  // Register fields
  const [pseudo, setPseudo] = useState('');
  const [pseudoStatus, setPseudoStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordConfirmValid, setPasswordConfirmValid] = useState<boolean | null>(null);

  const pseudoError = useFieldError();
  const emailError = useFieldError();
  const passwordConfirmError = useFieldError();

  const pseudoChecker = useRef(createPseudoChecker(checkPseudoAvailable));

  const switchIndex = () => setfirstIsActive(!firstIsActive);

  // --- Pseudo ---
  const handlePseudoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPseudo(value);
    setPseudoStatus('idle');
    if (pseudoError.error?.phase === 'visible') pseudoError.dismiss();
    if (value.length < 1) return;
    setPseudoStatus('checking');
    pseudoChecker.current(value, (available) => {
      if (available) {
        setPseudoStatus('available');
        pseudoError.dismiss();
      } else {
        setPseudoStatus('taken');
        pseudoError.show('_ Pseudo already taken');
      }
    });
  };

  // --- Email ---
  const handleEmailBlur = (e: { target: HTMLInputElement }) => {
    const value = e.target.value;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailValid(valid);
    if (!valid) {
      emailError.show('_ Invalid email format');
    } else {
      emailError.dismiss();
    }
  };


  // --- Password ---
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };

  // --- PasswordConfirm ---
  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    if (passwordConfirmValid === false) {
      setPasswordConfirmValid(null);
      passwordConfirmError.dismiss();
    }
  };

  const handlePasswordConfirmBlur = () => {
    const valid = password === passwordConfirm && passwordConfirm.length > 0;
    setPasswordConfirmValid(valid);
    if (!valid) {
      passwordConfirmError.show('_ Passwords do not match');
    } else {
      passwordConfirmError.dismiss();
    }
  };

  // --- Form validity ---
  const pwResult = validatePassword(password);
  const pwValid = Object.values(pwResult).every(Boolean);
  const registerFormValid =
    pseudo.length >= 1 &&
    pseudoStatus === 'available' &&
    pwValid &&
    password === passwordConfirm &&
    passwordConfirm.length > 0 &&
    emailValid === true;

  // --- Avatar ---
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

  // --- Submit ---
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
      const error = e as IApiError;
      setErrorMessage(error.message);
    }
  }

  const handleLogin = async (formData: FormData) => {
    const json = { email: formData.get('email'), password: formData.get('password') };
    await handleFetch('login', JSON.stringify(json));
  };

  const handleRegister = async (formData: FormData) => {
    if (croppedImage) await setAvatar(formData);
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
          <form noValidate action={firstIsActive ? handleLogin : handleRegister}>

            {/* Pseudo — register only */}
            <div className="expandable">
              <div>
                <div className={`field-wrapper${pseudoStatus === 'taken' ? ' field-error' : pseudoStatus === 'available' ? ' field-valid' : ''}`}>
                  <FormLine
                    name="pseudo"
                    required={!firstIsActive}
                    value={pseudo}
                    onChange={handlePseudoChange}
                  />
                  {pseudoStatus === 'available' && <ValidIcon className="field-icon field-icon--valid" size={14} />}
                  {pseudoStatus === 'taken' && <InvalidIcon className="field-icon field-icon--invalid" size={14} />}
                </div>
                {pseudoError.error && (
                  <div
                    className={`error-message${pseudoError.error.phase === 'exiting' ? ' error-message--exit' : ''}`}
                    onAnimationEnd={() => { if (pseudoError.error?.phase === 'exiting') pseudoError.clear(); }}
                  >
                    {pseudoError.error.text}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={`field-wrapper${emailValid === false ? ' field-error' : emailValid === true ? ' field-valid' : ''}`}>
              <FormLine
                name="email"
                inputType="email"
                required
                onBlur={handleEmailBlur}
              />
              {emailValid === true && <ValidIcon className="field-icon field-icon--valid" size={14} />}
              {emailValid === false && <InvalidIcon className="field-icon field-icon--invalid" size={14} />}
            </div>
            {emailError.error && (
              <div
                className={`error-message${emailError.error.phase === 'exiting' ? ' error-message--exit' : ''}`}
                onAnimationEnd={() => { if (emailError.error?.phase === 'exiting') emailError.clear(); }}
              >
                {emailError.error.text}
              </div>
            )}

            {/* Password */}
            <div className={`field-wrapper${passwordTouched && !pwValid ? ' field-error' : pwValid && password.length > 0 ? ' field-valid' : ''}`}>
              <FormLine
                name="password"
                inputType="password"
                label="Password:"
                required
                value={firstIsActive ? undefined : password}
                onChange={firstIsActive ? undefined : handlePasswordChange}
                onBlur={firstIsActive ? undefined : handlePasswordBlur}
              />
              {!firstIsActive && pwValid && password.length > 0 && <ValidIcon className="field-icon field-icon--valid" size={14} />}
            </div>

            {/* Password criteria checklist — register only */}
            {!firstIsActive && password.length > 0 && (
              <ul className="password-criteria">
                {PASSWORD_CRITERIA.map(({ key, label }) => (
                  <li
                    key={key}
                    className={
                      pwResult[key] ? 'criterion-ok'
                      : passwordTouched ? 'criterion-ko'
                      : 'criterion-neutral'
                    }
                  >
                    {pwResult[key] ? '[x]' : '[ ]'} {label}
                  </li>
                ))}
              </ul>
            )}

            {/* PasswordConfirm — register only */}
            <div className="expandable">
              <div>
                <div className={`field-wrapper${passwordConfirmValid === false ? ' field-error' : passwordConfirmValid === true ? ' field-valid' : ''}`}>
                  <FormLine
                    name="passwordConfirm"
                    inputType="password"
                    label="Confirm:"
                    required={!firstIsActive}
                    value={passwordConfirm}
                    onChange={handlePasswordConfirmChange}
                    onBlur={handlePasswordConfirmBlur}
                  />
                  {passwordConfirmValid === true && <ValidIcon className="field-icon field-icon--valid" size={14} />}
                  {passwordConfirmValid === false && <InvalidIcon className="field-icon field-icon--invalid" size={14} />}
                </div>
                {passwordConfirmError.error && (
                  <div
                    className={`error-message${passwordConfirmError.error.phase === 'exiting' ? ' error-message--exit' : ''}`}
                    onAnimationEnd={() => { if (passwordConfirmError.error?.phase === 'exiting') passwordConfirmError.clear(); }}
                  >
                    {passwordConfirmError.error.text}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar — register only */}
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
              label="Submit"
              disabled={!firstIsActive && !registerFormValid}
            />
          </form>
        </Box>
        {errorMessage && <div className="server-error">{errorMessage}</div>}
        {avatarWarning && (
          <div className="avatar-warning">
            <p>{avatarWarning}</p>
            <Button type="button" label="Continue" callback={() => navigate('/')} />
          </div>
        )}
      </div>
    </>
  );
}
