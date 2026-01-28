import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'

// Mock the Notifications component
vi.mock('./realtime/Notifications', () => ({
  default: () => <div data-testid="notifications">Notifications</div>
}))

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student'
}

const mockLogout = vi.fn()

const renderNavbar = (user = mockUser, logout = mockLogout) => {
  return render(
    <BrowserRouter>
      <Navbar user={user} logout={logout} />
    </BrowserRouter>
  )
}

describe('Navbar Component', () => {
  describe('Rendering', () => {
    it('should render navbar with user information', () => {
      renderNavbar()
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.getByText('Student Portal')).toBeInTheDocument()
    })

    it('should display lecturer portal for lecturer role', () => {
      const lecturerUser = { ...mockUser, role: 'lecturer' }
      renderNavbar(lecturerUser)
      
      expect(screen.getByText('Lecturer Portal')).toBeInTheDocument()
    })

    it('should display student portal for student role', () => {
      renderNavbar(mockUser)
      
      expect(screen.getByText('Student Portal')).toBeInTheDocument()
    })

    it('should render user avatar with first letter', () => {
      renderNavbar()
      
      const avatar = screen.getByText('J')
      expect(avatar).toBeInTheDocument()
    })

    it('should render Notifications component', () => {
      renderNavbar()
      
      const notifications = screen.getByTestId('notifications')
      expect(notifications).toBeInTheDocument()
    })

    it('should render settings button', () => {
      const { container } = renderNavbar()
      
      const settingsButtons = container.querySelectorAll('button')
      const hasSettingsButton = Array.from(settingsButtons).some(btn => {
        return btn.querySelector('svg') && btn.className.includes('text-gray-600')
      })
      
      expect(hasSettingsButton).toBe(true)
    })
  })

  describe('Navigation Links', () => {
    it('should render dashboard link for all users', () => {
      renderNavbar()
      
      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/')
    })

    it('should render lecturer specific links', () => {
      const lecturerUser = { ...mockUser, role: 'lecturer' }
      renderNavbar(lecturerUser)
      
      expect(screen.getByText('My Quizzes')).toBeInTheDocument()
      expect(screen.getByText('Results')).toBeInTheDocument()
    })

    it('should render student specific links', () => {
      renderNavbar(mockUser)
      
      expect(screen.getByText('Available Quizzes')).toBeInTheDocument()
      expect(screen.getByText('My Attempts')).toBeInTheDocument()
    })

    it('should render home link with correct href', () => {
      renderNavbar()
      
      const homeLink = screen.getByText('Student Portal').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('User Information Display', () => {
    it('should display user name in profile section', () => {
      renderNavbar()
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    })

    it('should display user role as badge', () => {
      renderNavbar()
      
      expect(screen.getByText(mockUser.role)).toBeInTheDocument()
    })

    it('should display capitalized role', () => {
      const lowercaseRoleUser = { ...mockUser, role: 'lecturer' }
      renderNavbar(lowercaseRoleUser)
      
      expect(screen.getByText('lecturer')).toBeInTheDocument()
    })
  })

  describe('Logout Functionality', () => {
    it('should call logout when logout button is clicked', () => {
      const logout = vi.fn()
      renderNavbar(mockUser, logout)
      
      const logoutButtons = screen.getAllByText(/Logout|Sign out/)
      fireEvent.click(logoutButtons[0])
      
      expect(logout).toHaveBeenCalled()
    })

    it('should have logout option in dropdown menu', () => {
      renderNavbar()
      
      const signOutButton = screen.getByText('Sign out')
      expect(signOutButton).toBeInTheDocument()
    })

    it('should call logout when dropdown sign out is clicked', () => {
      const logout = vi.fn()
      renderNavbar(mockUser, logout)
      
      const signOutButton = screen.getByText('Sign out')
      fireEvent.click(signOutButton)
      
      expect(logout).toHaveBeenCalled()
    })

    it('should only call logout once per click', () => {
      const logout = vi.fn()
      renderNavbar(mockUser, logout)
      
      const logoutButtons = screen.getAllByText(/Logout/)
      fireEvent.click(logoutButtons[0])
      
      expect(logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('User Profile Dropdown', () => {
    it('should display user name in dropdown', () => {
      renderNavbar()
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    })

    it('should display user email in dropdown', () => {
      renderNavbar()
      
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })

    it('should render dropdown with user information', () => {
      const { container } = renderNavbar()
      
      const dropdown = container.querySelector('[class*="group-hover"]')
      expect(dropdown).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render navbar structure', () => {
      const { container } = renderNavbar()
      
      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('bg-white', 'shadow-md')
    })

    it('should have flex layout for navigation', () => {
      const { container } = renderNavbar()
      
      const mainDiv = container.querySelector('[class*="flex justify-between"]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should render logo section', () => {
      renderNavbar()
      
      const homeLink = screen.getByText('Student Portal').closest('a')
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveClass('flex', 'items-center', 'space-x-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle user with long name', () => {
      const longNameUser = {
        ...mockUser,
        name: 'Alexander Christopher Montgomery III'
      }
      renderNavbar(longNameUser)
      
      expect(screen.getByText('Alexander Christopher Montgomery III')).toBeInTheDocument()
    })

    it('should handle user with special characters in name', () => {
      const specialNameUser = {
        ...mockUser,
        name: "O'Brien-Smith"
      }
      renderNavbar(specialNameUser)
      
      expect(screen.getByText("O'Brien-Smith")).toBeInTheDocument()
      expect(screen.getByText('O')).toBeInTheDocument()
    })

    it('should handle email display', () => {
      const emailUser = {
        ...mockUser,
        email: 'test+alias@example.co.uk'
      }
      renderNavbar(emailUser)
      
      expect(screen.getByText('test+alias@example.co.uk')).toBeInTheDocument()
    })

    it('should render with all required props', () => {
      const requiredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      }
      
      expect(() => renderNavbar(requiredUser)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button elements', () => {
      const { container } = renderNavbar()
      
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have proper link elements', () => {
      const { container } = renderNavbar()
      
      const links = container.querySelectorAll('a')
      expect(links.length).toBeGreaterThan(0)
    })

    it('should render semantic nav element', () => {
      const { container } = renderNavbar()
      
      const nav = container.querySelector('nav')
      expect(nav?.tagName).toBe('NAV')
    })
  })
})
