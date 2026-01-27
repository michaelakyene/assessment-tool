// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.contains('Sign In').click();
    
    // Wait for login to complete
    cy.url().should('not.include', '/login');
    cy.contains('Welcome').should('be.visible');
  });
});

Cypress.Commands.add('logout', () => {
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('startQuiz', (quizTitle) => {
  if (quizTitle) {
    cy.contains(quizTitle).click();
  } else {
    cy.get('[data-testid="quiz-card"]').first().click();
  }
  
  cy.contains('Start Quiz').click();
  cy.contains('Question 1').should('be.visible');
});

Cypress.Commands.add('answerAllQuestions', () => {
  // Answer all visible questions
  cy.get('input[type="radio"]').first().check({ multiple: true });
  cy.get('textarea').first().type('Test answer');
});

Cypress.Commands.add('completeQuiz', () => {
  cy.startQuiz();
  cy.answerAllQuestions();
  cy.contains('Submit Quiz').click();
  cy.contains('Yes, Submit').click();
  cy.contains('Quiz Results').should('be.visible');
});

Cypress.Commands.add('getQuestionByType', (type) => {
  // Navigate to a question of specific type
  cy.get(`[data-question-type="${type}"]`).first().click();
});

Cypress.Commands.add('setQuizTimer', (seconds) => {
  // Mock the timer for testing
  cy.window().then((win) => {
    win.localStorage.setItem('quiz-timer-override', seconds.toString());
  });
});

Cypress.Commands.add('createQuiz', (quizData) => {
  cy.contains('Create Quiz').click();
  
  // Fill basic info
  cy.get('input[name="title"]').type(quizData.title || 'Test Quiz');
  cy.get('textarea[name="description"]').type(quizData.description || 'Test description');
  cy.get('input[name="duration"]').clear().type(quizData.duration || 30);
  cy.get('input[name="maxAttempts"]').clear().type(quizData.maxAttempts || 3);
  
  // Add questions if provided
  if (quizData.questions) {
    quizData.questions.forEach((question, index) => {
      cy.contains('Add Question').click();
      
      cy.get(`textarea[name="questions[${index}].text"]`).type(question.text);
      cy.get(`select[name="questions[${index}].type"]`).select(question.type);
      
      if (question.options) {
        question.options.forEach((option, optIndex) => {
          cy.get(`input[name="questions[${index}].options[${optIndex}]"]`).type(option);
        });
      }
      
      if (question.correctAnswer) {
        cy.get(`input[name="questions[${index}].correctAnswer"]`).type(question.correctAnswer);
      }
      
      cy.get(`input[name="questions[${index}].marks"]`).clear().type(question.marks || 1);
    });
  }
  
  // Save quiz
  cy.contains('Save Quiz').click();
  cy.contains('Quiz created successfully').should('be.visible');
});

Cypress.Commands.add('deleteQuiz', (quizTitle) => {
  cy.contains(quizTitle)
    .parents('[data-testid="quiz-item"]')
    .within(() => {
      cy.get('[data-testid="delete-quiz"]').click();
    });
  
  cy.contains('Confirm Delete').click();
  cy.contains('Quiz deleted successfully').should('be.visible');
});

Cypress.Commands.add('publishQuiz', (quizTitle) => {
  cy.contains(quizTitle)
    .parents('[data-testid="quiz-item"]')
    .within(() => {
      cy.get('[data-testid="publish-quiz"]').click();
    });
  
  cy.contains('Published').should('be.visible');
});

Cypress.Commands.add('viewAnalytics', () => {
  cy.contains('Analytics').click();
  cy.contains('Performance Metrics').should('be.visible');
});

Cypress.Commands.add('checkNotification', () => {
  cy.get('[data-testid="notification-bell"]').click();
  cy.get('[data-testid="notification-list"]').should('be.visible');
});

Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Overwrite visit to always start from baseUrl
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  return originalFn(url, {
    ...options,
    onBeforeLoad: (win) => {
      // Mock localStorage for testing
      if (options?.mockStorage) {
        Object.keys(options.mockStorage).forEach(key => {
          win.localStorage.setItem(key, options.mockStorage[key]);
        });
      }
    }
  });
});

// Custom error handler
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  console.error('Uncaught exception:', err);
  return false;
});