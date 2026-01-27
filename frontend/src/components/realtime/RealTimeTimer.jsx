import { useState, useEffect, useCallback } from 'react';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';
import socketService from '../../services/socket';

const RealTimeTimer = ({ quizId, userId, duration, onTimeout, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isConnected, setIsConnected] = useState(false);
  const [serverTime, setServerTime] = useState(null);
  const [warningShown, setWarningShown] = useState(false);
  const [lastSync, setLastSync] = useState(Date.now());

  // Sync with server time
  const syncWithServer = useCallback(async () => {
    try {
      // In a real app, you would call an API endpoint to get server time
      const serverTime = Date.now(); // Replace with actual API call
      setServerTime(serverTime);
      setLastSync(serverTime);
      return serverTime;
    } catch (error) {
      console.error('Failed to sync with server time:', error);
      return Date.now();
    }
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate time percentage
  const getTimePercentage = () => {
    return (timeLeft / (duration * 60)) * 100;
  };

  // Get timer color based on time left
  const getTimerColor = () => {
    const percentage = getTimePercentage();
    if (percentage <= 10) return 'text-red-600 animate-pulse';
    if (percentage <= 25) return 'text-yellow-600';
    if (percentage <= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  // Get progress bar color
  const getProgressColor = () => {
    const percentage = getTimePercentage();
    if (percentage <= 10) return 'bg-red-500';
    if (percentage <= 25) return 'bg-yellow-500';
    if (percentage <= 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Show warnings at specific intervals
  const showWarnings = (seconds) => {
    if (seconds === 300 && !warningShown) { // 5 minutes
      alert('5 minutes remaining!');
      setWarningShown(true);
    }
    if (seconds === 60) { // 1 minute
      alert('1 minute remaining! Hurry up!');
    }
    if (seconds === 30) { // 30 seconds
      alert('30 seconds left!');
    }
  };

  useEffect(() => {
    // Initial sync
    syncWithServer();

    // Join quiz room
    socketService.joinQuiz(quizId, userId);

    // Listen for server time updates
    socketService.subscribeToEvent('time-update', (data) => {
      setTimeLeft(data.timeLeft);
      onTick?.(data.timeLeft);
    });

    // Listen for quiz end from server
    socketService.subscribeToEvent('quiz-ended', () => {
      onTimeout?.();
    });

    // Check connection status
    const checkConnection = () => {
      setIsConnected(socketService.isConnected);
    };

    // Set up periodic sync (every 30 seconds)
    const syncInterval = setInterval(syncWithServer, 30000);
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(connectionInterval);
      socketService.leaveQuiz(quizId, userId);
    };
  }, [quizId, userId, syncWithServer, onTick, onTimeout]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout?.();
      return;
    }

    // Show warnings
    showWarnings(timeLeft);

    // Update progress on server every 10 seconds
    if (timeLeft % 10 === 0) {
      socketService.updateProgress(quizId, userId, {
        timeLeft,
        percentage: getTimePercentage()
      });
    }

    // Client-side timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizId, userId, onTimeout, warningShown]);

  return (
    <div className="fixed top-24 right-6 z-40">
      <div className={`bg-white rounded-xl shadow-lg p-4 border-2 ${
        getTimePercentage() <= 10 ? 'border-red-200' : 
        getTimePercentage() <= 25 ? 'border-yellow-200' : 'border-blue-200'
      } min-w-64`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FiClock className={`w-5 h-5 ${getTimerColor()}`} />
            <span className="font-semibold text-gray-900">Quiz Timer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold mb-1 ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500">
            Time remaining
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>0%</span>
            <span>{Math.round(getTimePercentage())}%</span>
            <span>100%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${getTimePercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Warnings and Info */}
        {getTimePercentage() <= 25 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <FiAlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {getTimePercentage() <= 10 
                  ? 'Time is running out!' 
                  : 'Time is getting low!'}
              </span>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              ⚠️ Working offline. Progress may not sync until connection is restored.
            </div>
          </div>
        )}

        {/* Last Sync */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Last synced: {new Date(lastSync).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default RealTimeTimer;