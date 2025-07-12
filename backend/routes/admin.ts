import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Database } from '../database/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { asyncHandler } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard stats
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const db = Database.getDB();

  const stats = await Promise.all([
    // Total users
    new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    // Total questions
    new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM questions', (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    // Total answers
    new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM answers', (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    // Total votes
    new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM votes', (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers: stats[0],
      totalQuestions: stats[1],
      totalAnswers: stats[2],
      totalVotes: stats[3]
    }
  });
}));

// ===== USER MANAGEMENT =====

// Get all users with pagination
router.get('/users', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('role').optional().isIn(['guest', 'user', 'admin']).withMessage('Invalid role')
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';
    const offset = (page - 1) * limit;

    const db = Database.getDB();

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    // Get users
    const users = await new Promise<any[]>((resolve, reject) => {
      const query = `
        SELECT id, username, email, role, avatar, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as any[]);
      });
    });

    // Get total count
    const total = await new Promise<number>((resolve, reject) => {
      const countQuery = `SELECT COUNT(*) as count FROM users ${whereClause}`;
      db.get(countQuery, params, (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Create new user
router.post('/users',
  [
    body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['guest', 'user', 'admin']).withMessage('Invalid role')
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { username, email, password, role } = req.body;
    const db = Database.getDB();

    // Check if user exists
    const existingUser = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username or email already exists' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({
      success: true,
      data: { userId }
    });
  })
);

// Update user
router.put('/users/:id',
  [
    param('id').isInt().withMessage('Invalid user ID'),
    body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['guest', 'user', 'admin']).withMessage('Invalid role')
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const userId = parseInt(req.params.id);
    const { username, email, password, role } = req.body;
    const db = Database.getDB();

    // Check if user exists
    const user = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No valid fields to update' }
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    // Update user
    await new Promise<void>((resolve, reject) => {
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.run(query, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: { message: 'User updated successfully' }
    });
  })
);

// Delete user
router.delete('/users/:id',
  [param('id').isInt().withMessage('Invalid user ID')],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const userId = parseInt(req.params.id);
    const db = Database.getDB();

    // Prevent admin from deleting themselves
    if (userId === req.user!.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete your own account' }
      });
    }

    // Check if user exists
    const user = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Delete user (cascade will handle related records)
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: { message: 'User deleted successfully' }
    });
  })
);

// ===== QUESTION MANAGEMENT =====

// Get all questions with pagination
router.get('/questions',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;

    const db = Database.getDB();

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = 'WHERE q.title LIKE ? OR q.description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get questions with user info
    const questions = await new Promise<any[]>((resolve, reject) => {
      const query = `
        SELECT q.*, u.username as author_name,
               (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
        FROM questions q
        JOIN users u ON q.user_id = u.id
        ${whereClause}
        ORDER BY q.created_at DESC
        LIMIT ? OFFSET ?
      `;
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as any[]);
      });
    });

    // Get total count
    const total = await new Promise<number>((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM questions q 
        ${whereClause}
      `;
      db.get(countQuery, params, (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Delete question
router.delete('/questions/:id',
  [param('id').isInt().withMessage('Invalid question ID')],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const questionId = parseInt(req.params.id);
    const db = Database.getDB();

    // Check if question exists
    const question = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id FROM questions WHERE id = ?', [questionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found' }
      });
    }

    // Delete question (cascade will handle related records)
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM questions WHERE id = ?', [questionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: { message: 'Question deleted successfully' }
    });
  })
);

// ===== ANSWER MANAGEMENT =====

// Get all answers with pagination
router.get('/answers',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('questionId').optional().isInt().withMessage('Question ID must be an integer')
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const questionId = req.query.questionId ? parseInt(req.query.questionId as string) : null;
    const offset = (page - 1) * limit;

    const db = Database.getDB();

    let whereClause = '';
    const params: any[] = [];

    if (questionId) {
      whereClause = 'WHERE a.question_id = ?';
      params.push(questionId);
    }

    // Get answers with user and question info
    const answers = await new Promise<any[]>((resolve, reject) => {
      const query = `
        SELECT a.*, u.username as author_name, q.title as question_title
        FROM answers a
        JOIN users u ON a.user_id = u.id
        JOIN questions q ON a.question_id = q.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `;
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as any[]);
      });
    });

    // Get total count
    const total = await new Promise<number>((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM answers a 
        ${whereClause}
      `;
      db.get(countQuery, params, (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      success: true,
      data: {
        answers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Delete answer
router.delete('/answers/:id',
  [param('id').isInt().withMessage('Invalid answer ID')],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const answerId = parseInt(req.params.id);
    const db = Database.getDB();

    // Check if answer exists
    const answer = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id FROM answers WHERE id = ?', [answerId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Answer not found' }
      });
    }

    // Delete answer
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM answers WHERE id = ?', [answerId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: { message: 'Answer deleted successfully' }
    });
  })
);

export default router;
