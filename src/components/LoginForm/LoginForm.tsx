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
import { validatePassword, createPseudoChecker, EMAIL_REGEX } from '../../utils/validation';
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
  const dismiss = () => setError((prev) => prev ? { ...prev, phase: 'exiting' } : null);
  const clear = () => setError(null);
  return { error, show, dismiss, clear };
}

function FieldError({ error, onClear }: Readonly<{ error: ErrorState; onClear: () => void }>) {
  return (
    <div className={`collapsible${error ? ' collapsible--open' : ''}`}>
      <div
        className={`error-message${error?.phase === 'exiting' ? ' error-message--exit' : ''}`}
        onAnimationEnd={() => { if (error?.phase === 'exiting') onClear(); }}
      >
        {error?.text}
      </div>
    </div>
  );
}

type PseudoStatus = 'idle' | 'checking' | 'available' | 'taken';

function pseudoWrapperClass(status: PseudoStatus): string {
  if (status === 'taken') return 'field-wrapper field-error';
  if (status === 'available') return 'field-wrapper field-valid';
  return 'field-wrapper';
}

function emailWrapperClass(emailValid: boolean | null, isLogin: boolean): string {
  if (emailValid === false) return 'field-wrapper field-error';
  if (emailValid === true && !isLogin) return 'field-wrapper field-valid';
  return 'field-wrapper';
}

function passwordWrapperClass(isLogin: boolean, touched: boolean, valid: boolean, hasValue: boolean): string {
  if (!isLogin && touched && !valid) return 'field-wrapper field-error';
  if (!isLogin && valid && hasValue) return 'field-wrapper field-valid';
  return 'field-wrapper';
}

function passwordConfirmWrapperClass(confirmValid: boolean | null): string {
  if (confirmValid === false) return 'field-wrapper field-error';
  if (confirmValid === true) return 'field-wrapper field-valid';
  return 'field-wrapper';
}

function criterionClass(met: boolean, touched: boolean): string {
  if (met) return 'criterion-ok';
  if (touched) return 'criterion-ko';
  return 'criterion-neutral';
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
  const [pseudoStatus, setPseudoStatus] = useState<PseudoStatus>('idle');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordCriteriaVisible, setPasswordCriteriaVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordConfirmValid, setPasswordConfirmValid] = useState<boolean | null>(null);

  const pseudoError = useFieldError();
  const emailError = useFieldError();
  const passwordConfirmError = useFieldError();

  const pseudoChecker = useRef(createPseudoChecker(checkPseudoAvailable));

  const switchIndex = () => {
    setfirstIsActive((prev) => !prev);
    setEmail('');
    setEmailValid(null);
    emailError.clear();
  };

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
        pseudoError.show('Pseudo déjà utilisé');
      }
    });
  };

  // --- Email ---
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailValid === null) return;
    if (EMAIL_REGEX.test(value)) {
      setEmailValid(true);
      emailError.dismiss();
    } else {
      setEmailValid(null);
    }
  };

  const handleEmailBlur = (e: { target: HTMLInputElement }) => {
    const valid = EMAIL_REGEX.test(e.target.value);
    setEmailValid(valid);
    if (valid) {
      emailError.dismiss();
    } else {
      emailError.show('Invalid email format');
    }
  };

  // --- Password ---
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordCriteriaVisible(true);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    if (pwValid) setPasswordCriteriaVisible(false);
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
    if (valid) {
      passwordConfirmError.dismiss();
    } else {
      passwordConfirmError.show('Passwords do not match');
    }
  };

  // --- Form validity ---
  const loginFormValid = emailValid === true;
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
                <div className={pseudoWrapperClass(pseudoStatus)}>
                  <FormLine
                    name="pseudo"
                    required={!firstIsActive}
                    value={pseudo}
                    onChange={handlePseudoChange}
                  />
                  {pseudoStatus === 'available' && <ValidIcon className="field-icon field-icon--valid" size={14} />}
                  {pseudoStatus === 'taken' && <InvalidIcon className="field-icon field-icon--invalid" size={14} />}
                </div>
                <FieldError error={pseudoError.error} onClear={pseudoError.clear} />
              </div>
            </div>

            {/* Email */}
            <div className={emailWrapperClass(emailValid, firstIsActive)}>
              <FormLine
                name="email"
                inputType="email"
                required
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {!firstIsActive && emailValid === true && <ValidIcon className="field-icon field-icon--valid" size={14} />}
              {emailValid === false && <InvalidIcon className="field-icon field-icon--invalid" size={14} />}
            </div>
            <FieldError error={emailError.error} onClear={emailError.clear} />

            {/* Password */}
            <div className={passwordWrapperClass(firstIsActive, passwordTouched, pwValid, password.length > 0)}>
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
            <div className={`collapsible${!firstIsActive && passwordCriteriaVisible ? ' collapsible--open' : ''}`}>
              <ul className="password-criteria">
                {PASSWORD_CRITERIA.map(({ key, label }) => (
                  <li key={key} className={criterionClass(pwResult[key], passwordTouched)}>
                    {pwResult[key] ? '[x]' : '[ ]'} {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* PasswordConfirm — register only */}
            <div className="expandable">
              <div>
                <div className={passwordConfirmWrapperClass(passwordConfirmValid)}>
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
                <FieldError error={passwordConfirmError.error} onClear={passwordConfirmError.clear} />
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
              disabled={firstIsActive ? !loginFormValid : !registerFormValid}
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
