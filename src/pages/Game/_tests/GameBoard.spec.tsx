import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GameBoard } from '../GameBoard';

const noop = vi.fn();

describe('GameBoard', () => {
  it('renders cols × rows cells', () => {
    render(<GameBoard cols="3" rows="3" gameName="Morpion" handleCellClick={noop} />);
    expect(screen.getAllByRole('button').filter(el => el.classList.contains('cells'))).toHaveLength(9);
  });

  it('generates cell IDs with pattern c${col}${row}', () => {
    render(<GameBoard cols="3" rows="3" gameName="Morpion" handleCellClick={noop} />);
    expect(document.getElementById('c11')).toBeInTheDocument();
    expect(document.getElementById('c31')).toBeInTheDocument();
    expect(document.getElementById('c13')).toBeInTheDocument();
    expect(document.getElementById('c33')).toBeInTheDocument();
  });

  it('calls handleCellClick when a cell is clicked', async () => {
    const onClick = vi.fn();
    render(<GameBoard cols="2" rows="2" gameName="Morpion" handleCellClick={onClick} />);
    await userEvent.click(document.getElementById('c11')!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders cellsContent in the correct cell', () => {
    const content = { c11: <span data-testid="token">X</span> };
    render(<GameBoard cols="2" rows="2" gameName="Morpion" handleCellClick={noop} cellsContent={content} />);
    expect(screen.getByTestId('token')).toBeInTheDocument();
  });

  it('last column cell has a different right border than other cells', () => {
    render(<GameBoard cols="3" rows="1" gameName="Morpion" handleCellClick={noop} />);
    const middleCell = document.getElementById('c21')!;
    const lastCell = document.getElementById('c31')!;
    // jsdom normalises border values — compare relative to each other
    expect(middleCell.getAttribute('style')).not.toBe(lastCell.getAttribute('style'));
  });

  it('last row cell has a different bottom border than other cells', () => {
    render(<GameBoard cols="1" rows="3" gameName="Morpion" handleCellClick={noop} />);
    const middleCell = document.getElementById('c12')!;
    const lastCell = document.getElementById('c13')!;
    expect(middleCell.getAttribute('style')).not.toBe(lastCell.getAttribute('style'));
  });

  it('renders both jouability-guard and game-grid in the DOM', () => {
    render(<GameBoard cols="3" rows="3" gameName="Morpion" handleCellClick={noop} />);
    expect(document.querySelector('.jouability-guard')).toBeInTheDocument();
    expect(document.querySelector('.game-grid')).toBeInTheDocument();
  });

  it('guard message contains the gameName', () => {
    render(<GameBoard cols="7" rows="6" gameName="Puissance 4" handleCellClick={noop} />);
    expect(document.querySelector('.jouability-guard')?.textContent).toContain('Puissance 4');
  });
});
