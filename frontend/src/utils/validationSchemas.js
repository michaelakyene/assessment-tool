import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'lecturer']),
  studentId: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  duration: z.number().min(1).max(180),
  maxAttempts: z.number().min(1).max(10),
  isPublished: z.boolean().default(false),
  showResults: z.boolean().default(false)
});

export const questionSchema = z.object({
  text: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['mcq', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  marks: z.number().min(1).max(10),
  explanation: z.string().optional()
});