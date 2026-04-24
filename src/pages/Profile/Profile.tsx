import './Profile.css';
import '../../components/LoginForm/loginForm.css';
import '../../assets/icons/icons.css';
import { useCallback, useContext, useRef, useState, type ChangeEvent } from 'react';
import { AppContext } from '../../contexts';
import { Box, Button, CropperModal, FormLine } from '../../components';
import { checkPseudoAvailable, fetchUpdateUser } from '../../services/users.service';
import type { IUserResponse } from '../../interfaces/IUserResponse';
import { extension } from '../../utils/constants/extensions';
import { validatePassword, createPseudoChecker } from '../../utils/validation';
import ValidIcon from '../../assets/icons/ValidIcon';
import InvalidIcon from '../../assets/icons/InvalidIcon';

type PseudoStatus = 'idle' | 'checking' | 'available' | 'taken';
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

function pseudoWrapperClass(status: PseudoStatus): string {
  if (status === 'taken') return 'field-wrapper field-error';
  if (status === 'available') return 'field-wrapper field-valid';
  return 'field-wrapper';
}

function criterionClass(ok: boolean, touched: boolean): string {
  if (!touched) return 'criterion-neutral';
  return ok ? 'criterion-ok' : 'criterion-ko';
}

const PASSWORD_CRITERIA = [
  { key: 'length',    label: '8–16 characters' },
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'digit',     label: 'Number' },
  { key: 'special',   label: 'Special character' },
] as const;

export function Profile() {
  const appContext = useContext(AppContext);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState<boolean>(false);
  const formRef = useRef(null);
  const user = appContext.appState.user;

  // Pseudo
  const [pseudo, setPseudo] = useState(user?.pseudo ?? '');
  const [pseudoStatus, setPseudoStatus] = useState<PseudoStatus>('idle');
  const pseudoError = useFieldError();
  const pseudoChecker = useRef(createPseudoChecker(checkPseudoAvailable));

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handlePseudoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPseudo(value);
    setPseudoStatus('idle');
    pseudoError.clear();
    if (value === user?.pseudo || value.length < 2) return;
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
  }, [user?.pseudo, pseudoError]);

  const pwResult = validatePassword(newPassword);
  const newPasswordRulesValid = Object.values(pwResult).every(Boolean);
  const newPasswordConfirmValid = newPassword === newPasswordConfirm && newPasswordConfirm.length > 0;

  const pseudoChanged = pseudo !== user?.pseudo;
  const pseudoValid = !pseudoChanged || (pseudo.length >= 2 && pseudoStatus === 'available');
  const passwordSectionValid = !isPasswordChangeOpen
    || newPassword.length === 0
    || (newPasswordRulesValid && newPasswordConfirmValid);
  const formValid = pseudoValid && passwordSectionValid;

  const handleSubmit = async (formData: FormData) => {
    if (!isPasswordChangeOpen) {
      formData.delete('oldPassword');
      formData.delete('newPassword');
      formData.delete('newPasswordConfirm');
    }

    if (croppedImage) {
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

    try {
      const response: IUserResponse = await fetchUpdateUser(formData);
      appContext.setAppState((prev) => ({
        ...prev,
        user: { ...prev.user!, pseudo: response.pseudo, avatarUrl: null },
      }));
      appContext.setAppState((prev) => ({
        ...prev,
        user: { ...prev.user!, avatarUrl: response.avatarUrl },
      }));
      setCroppedImage('');
      setNewPassword('');
      setNewPasswordTouched(false);
      setNewPasswordConfirm('');
      setPseudoStatus('idle');
    } catch {
      // server error — out of scope for this story
    }
  };

  return (
    <>
      <CropperModal
        setImage={setCroppedImage}
        croppedImage={croppedImage}
        showModal={isCropperOpen}
        setShowModal={setIsCropperOpen}
      />
      <div className="profile-page">
        <h1>profil</h1>
        <Box>
          <form ref={formRef} action={handleSubmit} className={isPasswordChangeOpen ? 'expanded' : ''} noValidate>
            <div className={pseudoWrapperClass(pseudoStatus)}>
              <FormLine
                name="pseudo"
                value={pseudo}
                onChange={handlePseudoChange}
              />
              {pseudoStatus === 'available' && <ValidIcon className="field-icon field-icon--valid" size={14} />}
              {pseudoStatus === 'taken' && <InvalidIcon className="field-icon field-icon--invalid" size={14} />}
            </div>
            <FieldError error={pseudoError.error} onClear={pseudoError.clear} />
            <label htmlFor="changePassword">Changement de mot de passe ?</label>
            <input
              type="checkbox"
              id="changePassword"
              className="changePassword"
              onChange={(e) => setIsPasswordChangeOpen(e.target.checked)}
            />
            <div className="expandable">
              <div>
                <div className="field-wrapper">
                  <FormLine name="oldPassword" inputType="password" label="Mot de passe actuel" required={isPasswordChangeOpen} />
                </div>
                <div className={newPasswordTouched && !newPasswordRulesValid ? 'field-wrapper field-error' : 'field-wrapper'}>
                  <FormLine
                    name="newPassword"
                    inputType="password"
                    label="Nouveau mot de passe"
                    required={isPasswordChangeOpen}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => setNewPasswordTouched(true)}
                  />
                </div>
                <div className={`collapsible${isPasswordChangeOpen && newPassword.length > 0 ? ' collapsible--open' : ''}`}>
                  <ul className="password-criteria">
                    {PASSWORD_CRITERIA.map(({ key, label }) => (
                      <li key={key} className={criterionClass(pwResult[key], newPasswordTouched)}>
                        {pwResult[key] ? '[x]' : '[ ]'} {label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="field-wrapper">
                  <FormLine
                    name="newPasswordConfirm"
                    inputType="password"
                    label="Confirmez"
                    required={isPasswordChangeOpen}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  />
                </div>
                <div className={`collapsible${isPasswordChangeOpen && newPasswordConfirm.length > 0 ? ' collapsible--open' : ''}`}>
                  <div className={`pseudo-status pseudo-status--${newPasswordConfirmValid ? 'available' : 'taken'}`}>
                    {newPasswordConfirmValid ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Button label="avatar" callback={() => setIsCropperOpen(true)} />
              <div className="avatar-preview">
                {user?.avatarUrl && (
                  <img className="actualAvatar" alt="actual avatar" src={`${import.meta.env.VITE_BACKEND_URL}/assets/user_avatars/${user?.avatarUrl}`} />
                )}
                {user?.avatarUrl && croppedImage && (
                  <span className="avatarChange">{"=>"}</span>
                )}
                {croppedImage && (
                  <img className="newAvatar" alt="new avatar" src={croppedImage} />
                )}
              </div>
            </div>
            <Button type="submit" label="Valider" disabled={!formValid} />
          </form>
        </Box>
      </div>
    </>
  );
}
