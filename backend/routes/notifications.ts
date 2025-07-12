import express from 'express';
import { Database } from '../database/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const db = Database.getDB();

  const notifications = await new Promise<any[]>((resolve, reject) => {
    db.all(`
      SELECT id, type, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  const total = await new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
      [userId],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });

  const unreadCount = await new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit,
        totalNotifications: total,
      },
      unreadCount,
    },
  });
}));

// Mark notification as read
router.put('/:id/read', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const notificationId = parseInt(req.params.id);
  const userId = req.user!.id;
  const db = Database.getDB();

  await new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  res.json({
    success: true,
    data: { message: 'Notification marked as read' },
  });
}));

// Mark all notifications as read
router.put('/read-all', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user!.id;
  const db = Database.getDB();

  await new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  res.json({
    success: true,
    data: { message: 'All notifications marked as read' },
  });
}));

// Get unread count
router.get('/unread-count', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user!.id;
  const db = Database.getDB();

  const unreadCount = await new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });

  res.json({
    success: true,
    data: { unreadCount },
  });
}));

export default router;
