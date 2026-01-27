describe('Quiz Flow', () => {
  beforeEach(() => {
    // Login as student first
    cy.login('student@example.com', 'password123');
  });

  it('should show available quizzes on student dashboard', () => {
    cy.contains('Available Quizzes').should('be.visible');
    cy.get('[data-testid="quiz-card"]').should('have.length.at.least', 1);
  });

  it('should navigate to quiz details', () => {
    cy.get('[data-testid="quiz-card"]').first().click();
    cy.url().should('include', '/quiz/');
    cy.contains('Start Quiz').should('be.visible');
  });

  it('should start a quiz and show timer', () => {
    cy.get('[data-testid="quiz-card"]').first().click();
    cy.contains('Start Quiz').click();
    
    // Should show timer
    cy.contains('Time remaining').should('be.visible');
    cy.get('.timer').should('exist');
    
    // Should show first question
    cy.contains('Question 1').should('be.visible');
  });

  it('should answer multiple choice questions', () => {
    cy.startQuiz();
    
    // Answer first MCQ
    cy.get('input[type="radio"]').first().check();
    
    // Navigate to next question
    cy.contains('Next').click();
    
    // Should be on question 2
    cy.contains('Question 2').should('be.visible');
  });

  it('should answer true/false questions', () => {
    cy.startQuiz();
    
    // Navigate to a true/false question
    cy.getQuestionByType('true_false');
    
    // Select True
    cy.contains('label', 'True').click();
    cy.get('input[value="True"]').should('be.checked');
  });

  it('should answer short answer questions', () => {
    cy.startQuiz();
    
    // Navigate to a short answer question
    cy.getQuestionByType('short_answer');
    
    // Type answer
    cy.get('textarea').type('JavaScript is a programming language');
  });

  it('should show progress bar', () => {
    cy.startQuiz();
    
    // Progress bar should exist
    cy.get('.progress-bar').should('exist');
    
    // Should show answered count
    cy.contains('answered').should('be.visible');
  });

  it('should auto-submit when time runs out', () => {
    cy.startQuiz();
    
    // Set a short timer for testing (1 minute)
    cy.setQuizTimer(60);
    
    // Wait for timeout
    cy.wait(61000); // Wait 61 seconds
    
    // Should auto-submit
    cy.contains('Quiz submitted').should('be.visible');
    cy.url().should('include', '/results/');
  });

  it('should manually submit quiz', () => {
    cy.startQuiz();
    
    // Answer some questions
    cy.answerAllQuestions();
    
    // Click submit
    cy.contains('Submit Quiz').click();
    
    // Confirm submission
    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Yes, Submit').click();
    
    // Should show results
    cy.contains('Quiz Results').should('be.visible');
    cy.url().should('include', '/results/');
  });

  it('should show detailed results after submission', () => {
    cy.completeQuiz();
    
    // Should show score
    cy.contains('Your Score:').should('be.visible');
    
    // Should show question breakdown
    cy.contains('Question Breakdown').should('be.visible');
    
    // Should show correct/incorrect answers
    cy.get('.correct-answer').should('exist');
    cy.get('.incorrect-answer').should('exist');
    
    // Should show explanations
    cy.contains('Explanation:').should('exist');
  });

  it('should prevent multiple submissions', () => {
    cy.completeQuiz();
    
    // Try to retake quiz immediately
    cy.contains('Retake Quiz').click();
    
    // Should check attempt limit
    cy.contains('Maximum attempts reached').should('be.visible');
  });

  it('should save progress automatically', () => {
    cy.startQuiz();
    
    // Answer first question
    cy.get('input[type="radio"]').first().check();
    
    // Navigate away and back
    cy.visit('/');
    cy.go('back');
    
    // Answers should be preserved
    cy.get('input[type="radio"]').first().should('be.checked');
  });

  it('should show quiz statistics for lecturer', () => {
    // Login as lecturer
    cy.login('lecturer@example.com', 'password123');
    
    // Should see quiz management
    cy.contains('Manage Quizzes').should('be.visible');
    cy.contains('Create Quiz').should('be.visible');
    
    // View quiz analytics
    cy.get('[data-testid="quiz-analytics"]').first().click();
    
    // Should show analytics
    cy.contains('Quiz Analytics').should('be.visible');
    cy.contains('Average Score').should('be.visible');
    cy.contains('Score Distribution').should('be.visible');
  });

  it('should create new quiz as lecturer', () => {
    cy.login('lecturer@example.com', 'password123');
    
    cy.contains('Create Quiz').click();
    
    // Fill quiz details
    cy.get('input[name="title"]').type('New Test Quiz');
    cy.get('textarea[name="description"]').type('This is a test quiz');
    cy.get('input[name="duration"]').clear().type('30');
    cy.get('input[name="maxAttempts"]').clear().type('3');
    
    // Add questions
    cy.contains('Add Question').click();
    
    cy.get('textarea[name="questionText"]').type('What is 2+2?');
    cy.get('select[name="questionType"]').select('mcq');
    cy.get('input[name="option1"]').type('4');
    cy.get('input[name="option2"]').type('5');
    cy.get('input[name="correctOption"]').first().check();
    cy.get('input[name="marks"]').clear().type('5');
    
    cy.contains('Save Question').click();
    
    // Save quiz
    cy.contains('Save Quiz').click();
    
    // Should show success message
    cy.contains('Quiz created successfully').should('be.visible');
    
    // New quiz should appear in list
    cy.contains('New Test Quiz').should('be.visible');
  });

  it('should publish/unpublish quiz', () => {
    cy.login('lecturer@example.com', 'password123');
    
    // Find a quiz and toggle publish status
    cy.get('[data-testid="quiz-publish-toggle"]').first().click();
    
    // Should show confirmation
    cy.contains('Publish').click();
    
    // Status should update
    cy.get('[data-testid="quiz-status"]').first().should('contain', 'Published');
  });

  it('should view student attempts as lecturer', () => {
    cy.login('lecturer@example.com', 'password123');
    
    // Go to results
    cy.contains('Results').click();
    
    // Should see student attempts
    cy.get('[data-testid="student-attempt"]').should('have.length.at.least', 1);
    
    // View detailed results
    cy.get('[data-testid="view-results"]').first().click();
    
    // Should show student's detailed results
    cy.contains('Student Results').should('be.visible');
    cy.contains('Score Breakdown').should('be.visible');
  });
});