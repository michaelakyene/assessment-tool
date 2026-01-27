import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { useAuthStore } from '../store';

// Mock the store
vi.mock('../store', () => ({
  useAuthStore: vi.fn()
}));

// Mock socket service
vi.mock('../services/socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToEvent: vi.fn(),
    unsubscribeFromEvent: vi.fn()
  }
}));

describe('App Component', () => {
  const mockUseAuthStore = useAuthStore;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner initially', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading application/i)).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Since we're redirecting to /login, we should see login form
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('shows lecturer dashboard for lecturer role', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        id: '1', 
        name: 'Dr. Smith', 
        email: 'smith@university.edu', 
        role: 'lecturer' 
      },
      loading: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/welcome, dr. smith/i)).toBeInTheDocument();
    expect(screen.getByText(/manage your quizzes/i)).toBeInTheDocument();
  });

  it('shows student dashboard for student role', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        id: '2', 
        name: 'John Doe', 
        email: 'john@student.edu', 
        role: 'student' 
      },
      loading: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/welcome, john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/take quizzes and track your progress/i)).toBeInTheDocument();
  });

  it('has navigation links in navbar for lecturer', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        id: '1', 
        name: 'Dr. Smith', 
        email: 'smith@university.edu', 
        role: 'lecturer' 
      },
      loading: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/my quizzes/i)).toBeInTheDocument();
    expect(screen.getByText(/results/i)).toBeInTheDocument();
  });

  it('has navigation links in navbar for student', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        id: '2', 
        name: 'John Doe', 
        email: 'john@student.edu', 
        role: 'student' 
      },
      loading: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/available quizzes/i)).toBeInTheDocument();
    expect(screen.getByText(/my attempts/i)).toBeInTheDocument();
  });

  it('shows footer with copyright', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        id: '2', 
        name: 'John Doe', 
        email: 'john@student.edu', 
        role: 'student' 
      },
      loading: false
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Student Assessment System`)).toBeInTheDocument();
  });

  it('handles logout functionality', () => {
    const mockLogout = vi.fn();
    
    mockUseAuthStore.mockReturnValue({
      user: { 
        id: '2', 
        name: 'John Doe', 
        email: 'john@student.edu', 
        role: 'student' 
      },
      loading: false,
      logout: mockLogout
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // The logout button should be present
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });
});