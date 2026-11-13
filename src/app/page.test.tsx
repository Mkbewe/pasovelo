import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('Home', () => {
  it('renders the landing heading and prototype link', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Trener hiszpańskich form' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Otwórz prototyp' })).toHaveAttribute(
      'href',
      '/prototype.html'
    );
  });
});
