import './Profile.css';
import { useCallback, useContext, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { AppContext } from '../../contexts';
import { Box, Button, CropperModal, FormLine } from '../../components';
import { checkPseudoAvailable, fetchUpdateUser } from '../../services/users.service';
import type { IUserResponse } from '../../interfaces/IUserResponse';
import { extension } from '../../utils/constants/extensions';

function criterionClass(ok: boolean, touched: boolean): string {
  if (!touched) return 'criterion-neutral';
  return ok ? 'criterion-ok' : 'criterion-ko';
}

const PASSWORD_RULES = [
  { label: 'Au moins 1 chiffre', test: (v: string) => /\d/.test(v) },
  { label: 'Au moins 1 majuscule', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Au moins 1 minuscule', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Au moins 1 caractère spécial', test: (v: string) => /[^a-zA-Z0-9\s]/.test(v) },
  { label: '8 à 16 caractères, sans espace', test: (v: string) => /^[^\s]{8,16}$/.test(v) },
];

export function Profile() {
  const appContext = useContext(AppContext);
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState<boolean>(false);
  const formRef = useRef(null);
  const user = appContext.appState.user;

  // Pseudo contrôlé
  const [pseudo, setPseudo] = useState(user?.pseudo ?? '');
  const [pseudoStatus, setPseudoStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Password contrôlé
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handlePseudoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPseudo(value);
    setPseudoStatus('idle');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Pas de check si inchangé par rapport au pseudo actuel
    if (value === user?.pseudo || value.length < 2) return;
    setPseudoStatus('checking');
    debounceRef.current = setTimeout(async () => {
      const available = await checkPseudoAvailable(value);
      setPseudoStatus(available ? 'available' : 'taken');
    }, 1000);
  }, [user?.pseudo]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const newPasswordRulesValid = PASSWORD_RULES.every((r) => r.test(newPassword));
  const newPasswordConfirmValid = newPassword === newPasswordConfirm && newPasswordConfirm.length > 0;

  const pseudoChanged = pseudo !== user?.pseudo;
  const pseudoValid = !pseudoChanged || (pseudo.length >= 2 && pseudoStatus === 'available');
  const passwordSectionValid = !isPasswordChangeOpen || (newPasswordRulesValid && newPasswordConfirmValid);
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
      setNewPasswordConfirm('');
      setPseudoStatus('idle');
    } catch (e) {
      console.log(e);
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
          <form ref={formRef} action={handleSubmit} className={isPasswordChangeOpen ? 'expanded' : ''}>
            <FormLine
              name="pseudo"
              value={pseudo}
              onChange={handlePseudoChange}
            />
            {pseudoChanged && pseudo.length >= 2 && (
              <div className={`pseudo-status pseudo-status--${pseudoStatus}`}>
                {pseudoStatus === 'checking' && 'Vérification…'}
                {pseudoStatus === 'available' && '✓ Disponible'}
                {pseudoStatus === 'taken' && '✗ Déjà utilisé'}
              </div>
            )}
            <label htmlFor="changePassword">Changement de mot de passe ?</label>
            <input
              type="checkbox"
              id="changePassword"
              className="changePassword"
              onChange={(e) => setIsPasswordChangeOpen(e.target.checked)}
            />
            <div className="expandable">
              <div>
                <FormLine name="oldPassword" inputType="password" label="Mot de passe actuel" required={isPasswordChangeOpen} />
                <FormLine
                  name="newPassword"
                  inputType="password"
                  label="Nouveau mot de passe"
                  required={isPasswordChangeOpen}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setNewPasswordTouched(true)}
                />
                <div className={`collapsible${isPasswordChangeOpen && newPassword.length > 0 ? ' collapsible--open' : ''}`}>
                  <ul className="password-criteria">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(newPassword);
                      const cls = criterionClass(ok, newPasswordTouched);
                      return (
                        <li key={rule.label} className={cls}>
                          {ok ? '[x]' : '[ ]'} {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <FormLine
                  name="newPasswordConfirm"
                  inputType="password"
                  label="Confirmez"
                  required={isPasswordChangeOpen}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
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
