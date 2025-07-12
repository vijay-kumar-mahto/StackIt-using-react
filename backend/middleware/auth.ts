import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Database } from '../database/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: { message: 'Access token required' } });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ success: false, error: { message: 'Invalid or expired token' } });
      return;
    }

    const payload = decoded as { userId: number; username: string; email: string; role: string };
    req.user = {
      id: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };

    next();
  });
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const payload = decoded as { userId: number; username: string; email: string; role: string };
      req.user = {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };
    }
    next();
  });
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
      return;
    }

    next();
  };
};

export const generateToken = (user: { id: number; username: string; email: string; role: string }): string => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
