import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, MessageCircle, HelpCircle } from 'lucide-react';
import api from '../lib/api';

interface UserProfile {
  id: number;
  username: string;
  role: string;
  created_at: string;
  question_count: number;
  answer_count: number;
  total_votes: number;
  recentQuestions: Array<{
    id: number;
    title: string;
    votes: number;
    views: number;
    created_at: string;
  }>;
  recentAnswers: Array<{
    id: number;
    votes: number;
    is_accepted: boolean;
    question_id: number;
    question_title: string;
    created_at: string;
  }>;
}

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${username}`);
      if (response.data.success) {
        setUserProfile(response.data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">User not found</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to questions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.username}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(userProfile.created_at)}</span>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-xs rounded uppercase">
                {userProfile.role}
              </span>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{userProfile.question_count}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userProfile.answer_count}</div>
                <div className="text-sm text-gray-600">Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userProfile.total_votes}</div>
                <div className="text-sm text-gray-600">Total Votes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Questions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Recent Questions
          </h2>
          
          {userProfile.recentQuestions.length === 0 ? (
            <p className="text-gray-600">No questions yet</p>
          ) : (
            <div className="space-y-4">
              {userProfile.recentQuestions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <Link
                    to={`/questions/${question.id}`}
                    className="block hover:text-primary-600 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{question.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{question.votes} votes</span>
                      <span>{question.views} views</span>
                    </div>
                    <span>{formatTimeAgo(question.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Answers */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Recent Answers
          </h2>
          
          {userProfile.recentAnswers.length === 0 ? (
            <p className="text-gray-600">No answers yet</p>
          ) : (
            <div className="space-y-4">
              {userProfile.recentAnswers.map((answer) => (
                <div key={answer.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <Link
                    to={`/questions/${answer.question_id}`}
                    className="block hover:text-primary-600 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{answer.question_title}</h3>
                  </Link>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{answer.votes} votes</span>
                      {answer.is_accepted && (
                        <span className="text-green-600 font-medium">✓ Accepted</span>
                      )}
                    </div>
                    <span>{formatTimeAgo(answer.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
