import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { vi } from 'vitest';

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    render(
      <BrowserRouter>
        <Login login={mockLogin} />
      </BrowserRouter>
    );
  });

  it('renders login form', () => {
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to registration form', () => {
    const switchButton = screen.getByText(/don't have an account\?/i);
    fireEvent.click(switchButton);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates email format', () => {
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Assuming you show validation errors
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });
});