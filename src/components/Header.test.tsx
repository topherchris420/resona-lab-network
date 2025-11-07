import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

describe('Header', () => {
  it('renders the header with correct links and no nested buttons', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const createLink = screen.getByRole('link', { name: /publish/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink.tagName).toBe('A');

    const profileLink = screen.getByRole('link', { name: /user profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.tagName).toBe('A');

    const button = screen.queryByRole('button', { name: /publish/i });
    expect(button).not.toBeInTheDocument();
  });
});
