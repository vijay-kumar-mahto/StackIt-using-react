import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Database } from '../database/database';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// Extend global namespace for view cache
declare global {
  var viewCache: Map<string, number> | undefined;
}

const router = express.Router();

// Get all questions with pagination, filtering, and search
router.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string || '';
  const tag = req.query.tag as string || '';
  const sort = req.query.sort as string || 'newest';
  const offset = (page - 1) * limit;

  const db = Database.getDB();

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];

  if (search) {
    whereClause += ` AND (
      q.title LIKE ? OR 
      q.description LIKE ? OR 
      EXISTS (
        SELECT 1 FROM question_tags qt 
        JOIN tags t ON qt.tag_id = t.id 
        WHERE qt.question_id = q.id AND t.name LIKE ?
      )
    )`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (tag) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM question_tags qt 
      JOIN tags t ON qt.tag_id = t.id 
      WHERE qt.question_id = q.id AND t.name = ?
    )`;
    params.push(tag);
  }

  let orderClause = 'ORDER BY q.created_at DESC'; // Default: newest
  
  if (sort === 'votes') {
    orderClause = 'ORDER BY q.votes DESC, q.created_at DESC';
  } else if (sort === 'views') {
    orderClause = 'ORDER BY q.views DESC, q.created_at DESC';
  } else if (sort === 'oldest') {
    orderClause = 'ORDER BY q.created_at ASC';
  } else if (sort === 'unanswered') {
    whereClause += ' AND (SELECT COUNT(*) FROM answers WHERE question_id = q.id) = 0';
    orderClause = 'ORDER BY q.created_at DESC';
  }

  const query = `
    SELECT 
      q.*,
      u.username as author,
      u.avatar as author_avatar,
      COUNT(a.id) as answer_count,
      GROUP_CONCAT(t.name) as tags,
      GROUP_CONCAT(t.color) as tag_colors
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN answers a ON q.id = a.question_id
    LEFT JOIN question_tags qt ON q.id = qt.question_id
    LEFT JOIN tags t ON qt.tag_id = t.id
    ${whereClause}
    GROUP BY q.id
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT q.id) as total
    FROM questions q
    LEFT JOIN question_tags qt ON q.id = qt.question_id
    LEFT JOIN tags t ON qt.tag_id = t.id
    ${whereClause}
  `;

  const [questions, countResult] = await Promise.all([
    new Promise<any[]>((resolve, reject) => {
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    }),
    new Promise<any>((resolve, reject) => {
      db.get(countQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),
  ]);

  // Format questions with tags
  const formattedQuestions = questions.map(q => ({
    ...q,
    tags: q.tags ? q.tags.split(',').map((tag: string, index: number) => ({
      name: tag,
      color: q.tag_colors ? q.tag_colors.split(',')[index] : '#3b82f6'
    })) : [],
    tag_colors: undefined
  }));

  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      questions: formattedQuestions,
      pagination: {
        current: page,
        total: totalPages,
        limit,
        totalQuestions: total,
      },
    },
  });
}));

// Get single question with answers
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const questionId = parseInt(req.params.id);
  const db = Database.getDB();

  // Get user's IP address for view tracking
  const userIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.id || null;
  
  // Create a unique identifier for this view (IP + user + question)
  const viewKey = `${userIP}_${userId}_${questionId}`;
  
  // Simple in-memory cache to prevent multiple increments within a short time
  const VIEW_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  if (!global.viewCache) {
    global.viewCache = new Map();
  }
  
  const lastViewTime = global.viewCache.get(viewKey);
  const now = Date.now();
  
  // Only increment view count if this is a new view or last view was more than 5 minutes ago
  if (!lastViewTime || (now - lastViewTime) > VIEW_CACHE_DURATION) {
    await new Promise<void>((resolve, reject) => {
      db.run('UPDATE questions SET views = views + 1 WHERE id = ?', [questionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Update the cache with current time
    global.viewCache.set(viewKey, now);
    
    // Clean up old entries periodically (keep only last 1000 entries)
    if (global.viewCache!.size > 1000) {
      const entries = Array.from(global.viewCache!.entries()) as [string, number][];
      const cutoff = now - VIEW_CACHE_DURATION;
      global.viewCache!.clear();
      
      // Keep only recent entries
      entries.forEach(([key, time]) => {
        if (time > cutoff) {
          global.viewCache!.set(key, time);
        }
      });
    }
  }

  // Get question details
  const question = await new Promise<any>((resolve, reject) => {
    db.get(`
      SELECT 
        q.*,
        u.username as author,
        u.avatar as author_avatar,
        GROUP_CONCAT(t.name) as tags,
        GROUP_CONCAT(t.color) as tag_colors
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = ?
      GROUP BY q.id
    `, [questionId], (err, row) => {
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

  // Get answers
  const answers = await new Promise<any[]>((resolve, reject) => {
    db.all(`
      SELECT 
        a.*,
        u.username as author,
        u.avatar as author_avatar
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC
    `, [questionId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  // Get user's votes if authenticated
  let userVotes: any = {};
  if (req.user) {
    const votes = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT target_id, target_type, vote_type
        FROM votes
        WHERE user_id = ? AND (
          (target_type = 'question' AND target_id = ?) OR
          (target_type = 'answer' AND target_id IN (${answers.map(() => '?').join(',')}))
        )
      `, [req.user!.id, questionId, ...answers.map(a => a.id)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    userVotes = votes.reduce((acc, vote) => {
      const key = `${vote.target_type}_${vote.target_id}`;
      acc[key] = vote.vote_type;
      return acc;
    }, {});
  }

  // Format question with tags
  const formattedQuestion = {
    ...question,
    tags: question.tags ? question.tags.split(',').map((tag: string, index: number) => ({
      name: tag,
      color: question.tag_colors ? question.tag_colors.split(',')[index] : '#3b82f6'
    })) : [],
    tag_colors: undefined,
    userVote: userVotes[`question_${question.id}`] || null,
    answers: answers.map(answer => ({
      ...answer,
      userVote: userVotes[`answer_${answer.id}`] || null
    }))
  };

  res.json({
    success: true,
    data: { question: formattedQuestion },
  });
}));

// Create new question
router.post('/', authenticateToken,
  [
    body('title')
      .isLength({ min: 10, max: 200 })
      .withMessage('Title must be between 10 and 200 characters'),
    body('description')
      .isLength({ min: 20 })
      .withMessage('Description must be at least 20 characters'),
    body('tags')
      .isArray({ min: 1, max: 5 })
      .withMessage('Please select 1-5 tags'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { title, description, tags } = req.body;
    const userId = req.user!.id;
    const db = Database.getDB();

    // Create question
    const questionId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)',
        [title, description, userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Add tags
    for (const tagName of tags) {
      // Get or create tag
      let tagId = await new Promise<number>((resolve, reject) => {
        db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row.id);
          } else {
            // Create new tag
            db.run('INSERT INTO tags (name) VALUES (?)', [tagName], function (err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            });
          }
        });
      });

      // Link question to tag
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)',
          [questionId, tagId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.status(201).json({
      success: true,
      data: { questionId },
    });
  })
);

// Vote on a question
router.post('/:id/vote', authenticateToken,
  [
    body('type')
      .isIn(['up', 'down'])
      .withMessage('Vote type must be "up" or "down"'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const questionId = parseInt(req.params.id);
    const { type } = req.body;
    const userId = req.user!.id;
    const db = Database.getDB();

    // Check if question exists
    const question = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id, user_id FROM questions WHERE id = ?', [questionId], (err, row) => {
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

    // Users cannot vote on their own questions
    if (question.user_id === userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot vote on your own question' }
      });
    }

    // Check existing vote
    const existingVote = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT vote_type FROM votes WHERE user_id = ? AND target_id = ? AND target_type = "question"',
        [userId, questionId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.vote_type === type) {
        // Remove vote if clicking same type
        await new Promise<void>((resolve, reject) => {
          db.run(
            'DELETE FROM votes WHERE user_id = ? AND target_id = ? AND target_type = "question"',
            [userId, questionId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        voteChange = type === 'up' ? -1 : 1;
      } else {
        // Change vote type
        await new Promise<void>((resolve, reject) => {
          db.run(
            'UPDATE votes SET vote_type = ? WHERE user_id = ? AND target_id = ? AND target_type = "question"',
            [type, userId, questionId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        voteChange = type === 'up' ? 2 : -2;
      }
    } else {
      // Create new vote
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO votes (user_id, target_id, target_type, vote_type) VALUES (?, ?, "question", ?)',
          [userId, questionId, type],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      voteChange = type === 'up' ? 1 : -1;
    }

    // Update question vote count
    await new Promise<void>((resolve, reject) => {
      db.run(
        'UPDATE questions SET votes = votes + ? WHERE id = ?',
        [voteChange, questionId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated vote count
    const updatedQuestion = await new Promise<any>((resolve, reject) => {
      db.get('SELECT votes FROM questions WHERE id = ?', [questionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      success: true,
      data: {
        votes: updatedQuestion.votes,
        userVote: voteChange === 0 ? null : type
      }
    });
  })
);

export default router;
