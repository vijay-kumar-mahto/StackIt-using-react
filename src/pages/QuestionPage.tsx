import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Check, MessageCircle, Eye, User } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

interface Question {
  id: number;
  title: string;
  description: string;
  author: string;
  author_avatar?: string;
  votes: number;
  views: number;
  userVote?: 'up' | 'down' | null;
  tags: Array<{ name: string; color: string }>;
  created_at: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  content: string;
  author: string;
  author_avatar?: string;
  votes: number;
  is_accepted: boolean;
  userVote?: 'up' | 'down' | null;
  created_at: string;
}

const QuestionPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/questions/${id}`);
      if (response.data.success) {
        setQuestion(response.data.data.question);
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetType: 'question' | 'answer', targetId: number, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const endpoint = targetType === 'question' ? `/api/questions/${targetId}/vote` : `/api/answers/${targetId}/vote`;
      await api.post(endpoint, { type: voteType });
      
      // Refresh question data
      fetchQuestion();
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to vote';
      toast.error(message);
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    if (!user) {
      toast.error('Please login to accept answers');
      return;
    }

    try {
      await api.post(`/api/answers/${answerId}/accept`);
      toast.success('Answer accepted!');
      fetchQuestion();
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to accept answer';
      toast.error(message);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user) {
      toast.error('Please login to answer questions');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please enter your answer');
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      await api.post('/api/answers', {
        content: answerContent,
        questionId: parseInt(id!),
      });
      
      toast.success('Answer posted successfully!');
      setAnswerContent('');
      fetchQuestion();
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to post answer';
      toast.error(message);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Question not found</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to questions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-600">
        <Link to="/" className="text-primary-600 hover:text-primary-700">Questions</Link>
        <span className="mx-2">&gt;</span>
        <span className="truncate">{question.title}</span>
      </nav>

      {/* Question */}
      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        
        <div className="flex items-start space-x-4">
          {/* Vote Controls */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleVote('question', question.id, 'up')}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                question.userVote === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-600'
              }`}
              disabled={!user}
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <span className="text-lg font-semibold">{question.votes}</span>
            <button
              onClick={() => handleVote('question', question.id, 'down')}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                question.userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600'
              }`}
              disabled={!user}
            >
              <ArrowDown className="h-6 w-6" />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <div 
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Question Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{question.answers.length} answers</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <Link
                  to={`/users/${question.author}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {question.author}
                </Link>
                <span>asked {formatTimeAgo(question.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-6">
          {question.answers.map((answer) => (
            <div key={answer.id} className="card p-6">
              <div className="flex items-start space-x-4">
                {/* Vote Controls */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleVote('answer', answer.id, 'up')}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      answer.userVote === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-600'
                    }`}
                    disabled={!user}
                  >
                    <ArrowUp className="h-6 w-6" />
                  </button>
                  <span className="text-lg font-semibold">{answer.votes}</span>
                  <button
                    onClick={() => handleVote('answer', answer.id, 'down')}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      answer.userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600'
                    }`}
                    disabled={!user}
                  >
                    <ArrowDown className="h-6 w-6" />
                  </button>
                  
                  {/* Accept Answer */}
                  {user && user.username === question.author && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className={`p-2 rounded-full hover:bg-gray-100 ${
                        answer.is_accepted ? 'text-green-600 bg-green-50' : 'text-gray-600'
                      }`}
                      title={answer.is_accepted ? 'Accepted Answer' : 'Accept Answer'}
                    >
                      <Check className="h-6 w-6" />
                    </button>
                  )}
                  
                  {answer.is_accepted && user?.username !== question.author && (
                    <div className="p-2 text-green-600" title="Accepted Answer">
                      <Check className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  <div 
                    className="prose max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />

                  {/* Answer Meta */}
                  <div className="flex items-center justify-end text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <Link
                        to={`/users/${answer.author}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {answer.author}
                      </Link>
                      <span>answered {formatTimeAgo(answer.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Answer */}
      {user && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Answer</h3>
          
          <div className="mb-4">
            <RichTextEditor
              content={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmittingAnswer || !answerContent.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingAnswer ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="card p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to submit an answer</p>
          <Link to="/login" className="btn-primary">
            Log In
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
