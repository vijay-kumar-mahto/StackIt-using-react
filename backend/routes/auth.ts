import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { Database } from '../database/database';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Register
router.post('/register',
  [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { username, email, password } = req.body;
    const db = Database.getDB();

    // Check if user already exists
    const existingUser = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email],
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

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'user'],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Generate token
    const user = { id: userId, username, email, role: 'user' };
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          username,
          email,
          role: 'user',
        },
        token,
      },
    });
  })
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { email, password } = req.body;
    const db = Database.getDB();

    // Find user
    const user = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT id, username, email, password, role FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  })
);

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
}));

// Refresh token
router.post('/refresh', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
  }

  const token = generateToken(req.user);
  
  res.json({
    success: true,
    data: { token },
  });
}));

export default router;
