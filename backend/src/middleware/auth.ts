import { Request, Response, NextFunction } from 'express';
import { users } from '../store';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const username = req.headers['x-user-name'];

  if (!username || typeof username !== 'string') {
    return res.status(401).json({ error: 'Missing or invalid X-User-Name header' });
  }

  const user = users.find(u => u.name === username);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Attach user to request object (extend Request interface locally)
  (req as any).user = user;
  
  next();
};
