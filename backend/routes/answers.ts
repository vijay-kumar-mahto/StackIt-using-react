import express from 'express';
import { body, validationResult } from 'express-validator';
import { Database } from '../database/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Create new answer
router.post('/', authenticateToken,
  [
    body('content')
      .isLength({ min: 20 })
      .withMessage('Answer must be at least 20 characters'),
    body('questionId')
      .isInt({ min: 1 })
      .withMessage('Valid question ID is required'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { content, questionId } = req.body;
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

    // Create answer
    const answerId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO answers (content, question_id, user_id) VALUES (?, ?, ?)',
        [content, questionId, userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Create notification for question author (if not self)
    if (question.user_id !== userId) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO notifications (user_id, type, title, message, link) 
           VALUES (?, 'answer', 'New Answer', 'Someone answered your question', ?)`,
          [question.user_id, `/questions/${questionId}`],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.status(201).json({
      success: true,
      data: { answerId },
    });
  })
);

// Accept an answer
router.post('/:id/accept', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const answerId = parseInt(req.params.id);
  const userId = req.user!.id;
  const db = Database.getDB();

  // Get answer and question details
  const answerData = await new Promise<any>((resolve, reject) => {
    db.get(`
      SELECT a.id, a.question_id, a.user_id as answer_author,
             q.user_id as question_author
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id = ?
    `, [answerId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!answerData) {
    return res.status(404).json({
      success: false,
      error: { message: 'Answer not found' }
    });
  }

  // Only question author can accept answers
  if (answerData.question_author !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Only the question author can accept answers' }
    });
  }

  // Unaccept any previously accepted answer for this question
  await new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE answers SET is_accepted = FALSE WHERE question_id = ?',
      [answerData.question_id],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Accept this answer
  await new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE answers SET is_accepted = TRUE WHERE id = ?',
      [answerId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Update question's accepted_answer_id
  await new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE questions SET accepted_answer_id = ? WHERE id = ?',
      [answerId, answerData.question_id],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Create notification for answer author (if not self)
  if (answerData.answer_author !== userId) {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO notifications (user_id, type, title, message, link) 
         VALUES (?, 'vote', 'Answer Accepted', 'Your answer was accepted!', ?)`,
        [answerData.answer_author, `/questions/${answerData.question_id}`],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  res.json({
    success: true,
    data: { message: 'Answer accepted successfully' },
  });
}));

// Vote on an answer
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

    const answerId = parseInt(req.params.id);
    const { type } = req.body;
    const userId = req.user!.id;
    const db = Database.getDB();

    // Check if answer exists
    const answer = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id, user_id FROM answers WHERE id = ?', [answerId], (err, row) => {
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

    // Users cannot vote on their own answers
    if (answer.user_id === userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot vote on your own answer' }
      });
    }

    // Check existing vote
    const existingVote = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT vote_type FROM votes WHERE user_id = ? AND target_id = ? AND target_type = "answer"',
        [userId, answerId],
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
            'DELETE FROM votes WHERE user_id = ? AND target_id = ? AND target_type = "answer"',
            [userId, answerId],
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
            'UPDATE votes SET vote_type = ? WHERE user_id = ? AND target_id = ? AND target_type = "answer"',
            [type, userId, answerId],
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
          'INSERT INTO votes (user_id, target_id, target_type, vote_type) VALUES (?, ?, "answer", ?)',
          [userId, answerId, type],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      voteChange = type === 'up' ? 1 : -1;
    }

    // Update answer vote count
    await new Promise<void>((resolve, reject) => {
      db.run(
        'UPDATE answers SET votes = votes + ? WHERE id = ?',
        [voteChange, answerId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      data: { voteChange },
    });
  })
);

export default router;
