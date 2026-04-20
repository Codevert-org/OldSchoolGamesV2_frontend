import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FormLine } from '../FormLine';

describe('FormLine', () => {
  it('auto-generates label from name (first letter uppercased)', () => {
    render(<FormLine name="email" />);
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
  });

  it('uses explicit label when provided', () => {
    render(<FormLine name="pwd" label="Mot de passe:" />);
    expect(screen.getByLabelText('Mot de passe:')).toBeInTheDocument();
  });

  it('defaults to type text', () => {
    render(<FormLine name="username" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('uses provided inputType', () => {
    render(<FormLine name="pwd" inputType="password" label="Password:" />);
    expect(screen.getByLabelText('Password:')).toHaveAttribute('type', 'password');
  });

  it('is required when required prop is true', () => {
    render(<FormLine name="email" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('is not required by default', () => {
    render(<FormLine name="email" />);
    expect(screen.getByRole('textbox')).not.toBeRequired();
  });

  it('controlled mode: calls onChange on input', async () => {
    const onChange = vi.fn();
    render(<FormLine name="pseudo" value="abc" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'd');
    expect(onChange).toHaveBeenCalled();
  });

  it('uncontrolled mode: uses defaultValue', () => {
    render(<FormLine name="pseudo" value="hello" />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });
});
