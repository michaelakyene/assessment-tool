describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show login page by default', () => {
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account').should('be.visible');
    cy.contains('Student Assessment System').should('be.visible');
  });

  it('should switch between login and registration forms', () => {
    // Initially on login form
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.contains('Sign In').should('be.visible');

    // Switch to registration
    cy.contains("Don't have an account? Sign Up").click();
    
    // Should show registration fields
    cy.get('input[name="name"]').should('exist');
    cy.get('select[name="role"]').should('exist');
    cy.contains('Sign Up').should('be.visible');

    // Switch back to login
    cy.contains('Already have an account? Sign In').click();
    cy.contains('Sign In').should('be.visible');
  });

  it('should validate login form', () => {
    // Try to submit empty form
    cy.contains('Sign In').click();
    
    // Should show validation errors
    cy.get('input[name="email"]:invalid').should('exist');
    cy.get('input[name="password"]:invalid').should('exist');

    // Enter invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('123');
    cy.contains('Sign In').click();
    
    // Should show email validation error
    cy.get('input[name="email"]:invalid').should('exist');
  });

  it('should login with valid credentials', () => {
    // Mock successful login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        message: 'Login successful',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student'
        },
        token: 'fake-jwt-token'
      }
    }).as('loginRequest');

    // Fill form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('Sign In').click();

    // Wait for API call
    cy.wait('@loginRequest');
    
    // Should redirect to dashboard
    cy.url().should('not.include', '/login');
    cy.contains('Welcome, Test User').should('be.visible');
  });

  it('should handle login errors', () => {
    // Mock failed login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('failedLogin');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.contains('Sign In').click();

    cy.wait('@failedLogin');
    
    // Should show error message
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should register new user', () => {
    // Switch to registration
    cy.contains("Don't have an account? Sign Up").click();

    // Mock successful registration
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        message: 'User registered successfully',
        user: {
          id: '456',
          name: 'New User',
          email: 'new@example.com',
          role: 'student',
          studentId: 'S123456'
        },
        token: 'fake-jwt-token'
      }
    }).as('registerRequest');

    // Fill registration form
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('select[name="role"]').select('student');
    cy.get('input[name="studentId"]').type('S123456');
    
    cy.contains('Sign Up').click();

    cy.wait('@registerRequest');
    
    // Should redirect to dashboard
    cy.url().should('not.include', '/login');
    cy.contains('Welcome, New User').should('be.visible');
  });

  it('should validate password match', () => {
    cy.contains("Don't have an account? Sign Up").click();

    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('different');
    
    // Trigger validation
    cy.get('input[name="confirmPassword"]').blur();
    
    // Should show password mismatch error
    cy.contains("Passwords don't match").should('be.visible');
  });

  it('should logout successfully', () => {
    // Login first
    cy.login('test@example.com', 'password123');
    
    // Click logout
    cy.contains('Logout').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account').should('be.visible');
  });

  it('should persist login after refresh', () => {
    // Login
    cy.login('test@example.com', 'password123');
    
    // Refresh page
    cy.reload();
    
    // Should still be logged in
    cy.contains('Welcome, Test User').should('be.visible');
    cy.url().should('not.include', '/login');
  });

  it('should show demo credentials hint', () => {
    cy.contains('Demo Credentials: test@example.com / password123').should('be.visible');
  });
});