import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, MessageCircle, Eye, ArrowUp, User, Search } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Question {
  id: number;
  title: string;
  description: string;
  author: string;
  author_avatar?: string;
  votes: number;
  views: number;
  answer_count: number;
  tags: Array<{ name: string; color: string }>;
  created_at: string;
}

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuestions();
  }, [sortBy, currentPage, searchParams]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        sort: sortBy,
        limit: '5',
      });

      const search = searchParams.get('search');
      if (search) {
        params.append('search', search);
      }

      const tag = searchParams.get('tag');
      if (tag) {
        params.append('tag', tag);
      }

      const response = await api.get(`/api/questions?${params}`);
      if (response.data.success) {
        setQuestions(response.data.data.questions);
        setTotalPages(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
    setCurrentPage(1);
  };

  const handleAskQuestion = () => {
    if (!user) {
      toast.error('Please login to ask a question');
      navigate('/login');
      return;
    }
    navigate('/ask');
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

  const Pagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-1 sm:px-3 py-2 text-xs sm:text-sm">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm border ${
            i === currentPage
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-1 sm:px-3 py-2 text-xs sm:text-sm">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-1 mt-8 px-4">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">‹</span>
        </button>
        <div className="flex items-center space-x-1 overflow-x-auto">
          {pages}
        </div>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">›</span>
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleAskQuestion}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
          >
            Ask New Question
          </button>
          
          {/* Sort/Filter Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-full sm:w-auto"
            >
              <option value="newest">Newest</option>
              <option value="unanswered">Unanswered</option>
              <option value="votes">Most Voted</option>
              <option value="views">Most Viewed</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md lg:max-w-lg">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No questions found.</p>
          <button
            onClick={handleAskQuestion}
            className="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ask the first question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow">
              {/* Question Stats */}
              <div className="flex items-start space-x-3 sm:space-x-4">
                {/* Stats - Hidden on mobile, shown as horizontal row on tablet+ */}
                <div className="hidden sm:flex sm:flex-col sm:items-center sm:space-y-2 text-sm text-gray-600 min-w-[60px]">
                  <div className="flex items-center space-x-1">
                    <ArrowUp className="h-4 w-4" />
                    <span>{question.votes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{question.answer_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{question.views}</span>
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <Link
                    to={`/questions/${question.id}`}
                    className="block hover:text-primary-600 transition-colors"
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {question.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">
                    {question.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>

                  {/* Mobile Stats - Shown only on mobile */}
                  <div className="flex sm:hidden items-center space-x-4 text-xs text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <ArrowUp className="h-3 w-3" />
                      <span>{question.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{question.answer_count} ans</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{question.views}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                    {question.tags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => setSearchParams({ tag: tag.name })}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>

                  {/* Author and Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <Link
                        to={`/users/${question.author}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {question.author}
                      </Link>
                    </div>
                    <span>{formatTimeAgo(question.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && questions.length > 0 && totalPages > 1 && <Pagination />}
    </div>
  );
};

export default HomePage;
