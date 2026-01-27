import { create } from 'zustand';

const useQuizStore = create((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  attempts: [],
  
  // Actions
  setQuizzes: (quizzes) => set({ quizzes }),
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  addQuiz: (quiz) => set((state) => ({ quizzes: [...state.quizzes, quiz] })),
  updateQuiz: (updatedQuiz) => set((state) => ({
    quizzes: state.quizzes.map(q => 
      q.id === updatedQuiz.id ? updatedQuiz : q
    )
  })),
  deleteQuiz: (quizId) => set((state) => ({
    quizzes: state.quizzes.filter(q => q.id !== quizId)
  })),
  
  // Attempts
  setAttempts: (attempts) => set({ attempts }),
  addAttempt: (attempt) => set((state) => ({ attempts: [...state.attempts, attempt] }))
}));

export default useQuizStore;