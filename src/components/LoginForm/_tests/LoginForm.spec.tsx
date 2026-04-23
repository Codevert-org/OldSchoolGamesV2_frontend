import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { AppContext } from '../../../contexts';
import type { Appstate } from '../../../contexts/appContext';
import type { Dispatch, SetStateAction } from 'react';

vi.mock('../../../services/users.service', () => ({
  checkPseudoAvailable: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../services/auth.service', () => ({
  fetchAuth: vi.fn(),
}));

const mockSetAppState = vi.fn();
const appContextValue = {
  appState: { accessToken: '', user: null } as Appstate,
  setAppState: mockSetAppState as Dispatch<SetStateAction<Appstate>>,
};

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={appContextValue}>
        <LoginForm />
      </AppContext.Provider>
    </MemoryRouter>
  );
}

function switchToRegister() {
  const switchBtn = screen.getByRole('button', { name: /register/i });
  fireEvent.click(switchBtn);
}

describe('LoginForm — login mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submit button is disabled when email is empty', () => {
    renderLoginForm();
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('submit button is disabled when email is invalid', async () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: /submit/i });
      expect(submitBtn).toBeDisabled();
    });
  });

  it('submit button is enabled when email is valid', async () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: /submit/i });
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('shows error message on email blur when format invalid', async () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeTruthy();
    });
  });

  it('email state resets when switching modes', async () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeTruthy();
    });
    const switchBtn = screen.getByRole('button', { name: /register/i });
    fireEvent.click(switchBtn);
    await waitFor(() => {
      expect(screen.queryByText(/invalid email format/i)).toBeNull();
    });
  });
});

describe('LoginForm — register mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('form has noValidate attribute', () => {
    renderLoginForm();
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    expect(form!.hasAttribute('novalidate')).toBe(true);
  });

  it('submit button is disabled when register form is empty', () => {
    renderLoginForm();
    switchToRegister();
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('password criteria checklist appears when typing in password field', async () => {
    renderLoginForm();
    switchToRegister();
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'Ab1!' } });
    await waitFor(() => {
      expect(screen.getByText(/8.16 characters/i)).toBeTruthy();
    });
  });

  it('satisfied password criterion shows [x]', async () => {
    renderLoginForm();
    switchToRegister();
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'Abcdef1!' } });
    await waitFor(() => {
      const items = screen.getAllByText(/\[x\]/);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it('shows error message on passwordConfirm blur when mismatch', async () => {
    renderLoginForm();
    switchToRegister();
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'Abcdef1!' } });
    const confirmInput = screen.getByLabelText(/confirm/i);
    fireEvent.change(confirmInput, { target: { value: 'different' } });
    fireEvent.blur(confirmInput);
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
  });
});
