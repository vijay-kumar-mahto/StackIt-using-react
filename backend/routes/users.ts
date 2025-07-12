import express from 'express';
import { Database } from '../database/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Get user profile
router.get('/:username', asyncHandler(async (req: express.Request, res: express.Response) => {
  const username = req.params.username;
  const db = Database.getDB();

  const user = await new Promise<any>((resolve, reject) => {
    db.get(`
      SELECT 
        u.id, u.username, u.email, u.role, u.avatar, u.created_at,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT a.id) as answer_count,
        COALESCE(SUM(q.votes), 0) + COALESCE(SUM(a.votes), 0) as total_votes
      FROM users u
      LEFT JOIN questions q ON u.id = q.user_id
      LEFT JOIN answers a ON u.id = a.user_id
      WHERE u.username = ?
      GROUP BY u.id
    `, [username], (err, row) => {
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

  // Get recent questions
  const recentQuestions = await new Promise<any[]>((resolve, reject) => {
    db.all(`
      SELECT id, title, votes, views, created_at
      FROM questions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [user.id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  // Get recent answers
  const recentAnswers = await new Promise<any[]>((resolve, reject) => {
    db.all(`
      SELECT a.id, a.votes, a.is_accepted, a.created_at,
             q.id as question_id, q.title as question_title
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [user.id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  res.json({
    success: true,
    data: {
      user: {
        ...user,
        email: undefined, // Don't expose email
        recentQuestions,
        recentAnswers
      }
    },
  });
}));

// Update user profile (authenticated user only)
router.put('/profile', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user!.id;
  const { username, email } = req.body;
  const db = Database.getDB();

  // Check if username/email already exists (excluding current user)
  const existingUser = await new Promise<any>((resolve, reject) => {
    db.get(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: { message: 'Username or email already exists' }
    });
  }

  // Update user
  await new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  res.json({
    success: true,
    data: { message: 'Profile updated successfully' },
  });
}));

export default router;
