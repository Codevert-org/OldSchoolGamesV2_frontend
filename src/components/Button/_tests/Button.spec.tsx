import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls callback on click', async () => {
    const cb = vi.fn();
    render(<Button label="Go" callback={cb} />);
    await userEvent.click(screen.getByRole('button'));
    expect(cb).toHaveBeenCalledOnce();
  });

  it('does not throw when clicked without callback', async () => {
    render(<Button label="No cb" />);
    await userEvent.click(screen.getByRole('button'));
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Off" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call callback when disabled', async () => {
    const cb = vi.fn();
    render(<Button label="Off" callback={cb} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(cb).not.toHaveBeenCalled();
  });

  it('renders ReactNode as label', () => {
    render(<Button label={<span data-testid="node">icon</span>} />);
    expect(screen.getByTestId('node')).toBeInTheDocument();
  });
});
