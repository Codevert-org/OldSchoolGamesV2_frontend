import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ValidIcon from './ValidIcon';
import InvalidIcon from './InvalidIcon';

describe('ValidIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ValidIcon />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('uses currentColor — no hardcoded fill or stroke color', () => {
    const { container } = render(<ValidIcon />);
    const svg = container.querySelector('svg')!;
    const allElements = [svg, ...Array.from(svg.querySelectorAll('*'))];
    for (const el of allElements) {
      const fill = el.getAttribute('fill');
      const stroke = el.getAttribute('stroke');
      if (fill && fill !== 'none' && fill !== 'currentColor') {
        throw new Error(`Hardcoded fill found: ${fill}`);
      }
      if (stroke && stroke !== 'none' && stroke !== 'currentColor') {
        throw new Error(`Hardcoded stroke found: ${stroke}`);
      }
    }
  });

  it('applies custom size prop', () => {
    const { container } = render(<ValidIcon size={24} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });

  it('applies custom className prop', () => {
    const { container } = render(<ValidIcon className="my-icon" />);
    expect(container.querySelector('svg')!.classList.contains('my-icon')).toBe(true);
  });
});

describe('InvalidIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<InvalidIcon />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('uses currentColor — no hardcoded fill or stroke color', () => {
    const { container } = render(<InvalidIcon />);
    const svg = container.querySelector('svg')!;
    const allElements = [svg, ...Array.from(svg.querySelectorAll('*'))];
    for (const el of allElements) {
      const fill = el.getAttribute('fill');
      const stroke = el.getAttribute('stroke');
      if (fill && fill !== 'none' && fill !== 'currentColor') {
        throw new Error(`Hardcoded fill found: ${fill}`);
      }
      if (stroke && stroke !== 'none' && stroke !== 'currentColor') {
        throw new Error(`Hardcoded stroke found: ${stroke}`);
      }
    }
  });

  it('applies custom size prop', () => {
    const { container } = render(<InvalidIcon size={16} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });

  it('applies custom className prop', () => {
    const { container } = render(<InvalidIcon className="err-icon" />);
    expect(container.querySelector('svg')!.classList.contains('err-icon')).toBe(true);
  });
});
