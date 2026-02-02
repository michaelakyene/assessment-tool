const calculateScore = (questions, userAnswers) => {
  let totalMarks = 0;
  let obtainedMarks = 0;
  const detailedResults = [];

  questions.forEach(question => {
    totalMarks += question.marks;
    
    const userAnswer = userAnswers.find(
      ans => ans.questionId.toString() === question._id.toString()
    );

    if (!userAnswer) {
      detailedResults.push({
        questionId: question._id,
        correct: false,
        marksObtained: 0,
        userAnswer: null,
        correctAnswer: getCorrectAnswer(question),
        feedback: 'No answer provided'
      });
      return;
    }

    let isCorrect = false;
    let marksObtained = 0;

    switch (question.type) {
      case 'mcq':
        isCorrect = userAnswer.response === question.correctAnswer;
        marksObtained = isCorrect ? question.marks : 0;
        break;

      case 'true_false': {
        const normalizedResponse = String(userAnswer.response || '').trim().toLowerCase();
        const normalizedCorrect = String(question.correctAnswer || '').trim().toLowerCase();
        isCorrect = normalizedResponse === normalizedCorrect;
        marksObtained = isCorrect ? question.marks : 0;
        break;
      }

      case 'short_answer':
        // Case-insensitive comparison, trim whitespace
        const userResponse = userAnswer.response.trim().toLowerCase();
        const correctResponse = question.correctAnswer.trim().toLowerCase();
        
        // Exact match
        if (userResponse === correctResponse) {
          isCorrect = true;
          marksObtained = question.marks;
        } 
        // Partial match (for more lenient grading)
        else if (userResponse.includes(correctResponse) || correctResponse.includes(userResponse)) {
          isCorrect = true;
          marksObtained = Math.floor(question.marks * 0.5); // 50% for partial match
        }
        break;

      case 'multiple_select':
        if (Array.isArray(userAnswer.response)) {
          const correctOptions = question.options.filter(opt => opt.isCorrect);
          const selectedOptions = userAnswer.response;
          
          // All correct and no incorrect = full marks
          const allCorrect = correctOptions.every(opt => 
            selectedOptions.includes(opt.text)
          );
          const noIncorrect = selectedOptions.every(opt =>
            correctOptions.some(correct => correct.text === opt)
          );
          
          isCorrect = allCorrect && noIncorrect;
          marksObtained = isCorrect ? question.marks : 0;
        }
        break;
    }

    obtainedMarks += marksObtained;

    detailedResults.push({
      questionId: question._id,
      correct: isCorrect,
      marksObtained,
      userAnswer: userAnswer.response,
      correctAnswer: getCorrectAnswer(question),
      feedback: isCorrect ? 'Correct!' : 'Incorrect',
      explanation: question.explanation
    });
  });

  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  return {
    totalMarks,
    obtainedMarks,
    percentage: parseFloat(percentage.toFixed(2)),
    detailedResults,
    grade: calculateGrade(percentage)
  };
};

const getCorrectAnswer = (question) => {
  switch (question.type) {
    case 'mcq':
    case 'true_false':
    case 'short_answer':
      return question.correctAnswer;
    case 'multiple_select':
      return question.options.filter(opt => opt.isCorrect).map(opt => opt.text);
    default:
      return null;
  }
};

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
};

const calculateTimeBonus = (timeTaken, totalTime) => {
  // Bonus for finishing early: up to 10% extra marks
  const timeRatio = timeTaken / totalTime;
  if (timeRatio < 0.5) {
    return 0.1; // 10% bonus for finishing in half the time
  } else if (timeRatio < 0.75) {
    return 0.05; // 5% bonus
  } else if (timeRatio < 0.9) {
    return 0.02; // 2% bonus
  }
  return 0;
};

const generateFeedback = (percentage) => {
  if (percentage >= 90) {
    return 'Excellent work! You have mastered this topic.';
  } else if (percentage >= 80) {
    return 'Great job! You have a strong understanding of the material.';
  } else if (percentage >= 70) {
    return 'Good work! You understand the main concepts.';
  } else if (percentage >= 60) {
    return 'Satisfactory. Review the areas you missed.';
  } else if (percentage >= 50) {
    return 'Needs improvement. Focus on the fundamental concepts.';
  } else {
    return 'Please review the material thoroughly and retake the quiz.';
  }
};

module.exports = {
  calculateScore,
  calculateGrade,
  calculateTimeBonus,
  generateFeedback,
  getCorrectAnswer
};