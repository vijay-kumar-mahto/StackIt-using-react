import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag').max(5, 'Maximum 5 tags allowed'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  });

  const addTag = (tagName: string) => {
    const normalizedTag = tagName.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      const newTags = [...tags, normalizedTag];
      setTags(newTags);
      setValue('tags', newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput.trim());
        setTagInput('');
      }
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/api/questions', {
        ...data,
        description,
      });

      if (response.data.success) {
        toast.success('Question posted successfully!');
        navigate(`/questions/${response.data.data.questionId}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to post question';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              placeholder="Be specific and imagine you're asking a question to another person"
              className="input-field"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              content={description}
              onChange={(content) => {
                setDescription(content);
                setValue('description', content);
              }}
              placeholder="Include all the information someone would need to answer your question"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (press Enter or comma to add)"
                className="input-field"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionPage;
