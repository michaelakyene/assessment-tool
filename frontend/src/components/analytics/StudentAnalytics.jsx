import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store';
import { FiUser, FiAward, FiClock, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { api } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import ProgressChart from '../charts/ProgressChart';

const StudentAnalytics = ({ studentId }) => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    fetchStudentAnalytics();
  }, [studentId]);

  const fetchStudentAnalytics = async () => {
    try {
      setLoading(true);
      const endpoint = studentId 
        ? `/analytics/student/${studentId}`
        : '/analytics/student/me';
      
      const data = await api.get(endpoint);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 7) return '🔥';
    if (streak >= 5) return '⭐';
    if (streak >= 3) return '⚡';
    return '📚';
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading analytics..." />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600">Start taking quizzes to see your analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Profile */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {user?.role}
                </span>
                {user?.studentId && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    {user.studentId}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {analytics.averagePercentage}%
            </div>
            <div className="text-sm text-gray-500">Overall Average</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalQuizzesTaken}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiAward className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAttempts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.bestScore}%</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiAward className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Learning Streak</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{analytics.streak || 0}</p>
                <span className="text-xl">{getStreakEmoji(analytics.streak || 0)}</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress Over Time</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FiClock />
            <span>Last {analytics.recentAttempts?.length || 0} attempts</span>
          </div>
        </div>
        <ProgressChart 
          data={{
            labels: analytics.recentAttempts?.map(a => 
              new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ) || [],
            scores: analytics.recentAttempts?.map(a => a.percentage) || [],
            average: analytics.averagePercentage,
            highest: analytics.bestScore,
            attempts: analytics.totalAttempts
          }}
        />
      </div>

      {/* Recent Attempts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {analytics.recentAttempts?.map((attempt, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{attempt.quizTitle}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      <FiCalendar className="inline w-4 h-4 mr-1" />
                      {new Date(attempt.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Attempt #{attempt.attemptNumber}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    attempt.percentage >= 80 ? 'text-green-600' :
                    attempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {attempt.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {attempt.score}/{attempt.totalMarks} marks
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance by Category */}
      {analytics.categoryPerformance && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
          <div className="space-y-4">
            {analytics.categoryPerformance.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-600">{category.averageScore}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      category.averageScore >= 80 ? 'bg-green-500' :
                      category.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${category.averageScore}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.attempts} attempts • Best: {category.bestScore}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;