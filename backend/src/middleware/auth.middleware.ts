import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Middleware to authenticate user and attach user info (including role) to req.user
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or token is not Bearer type.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode JWT payload, which now includes 'role'
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach decoded user info (including role) to req.user
    req.user = decoded as { id: string; email: string; role: string }; // Updated type
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// Middleware to check if the authenticated user has the 'admin' role
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};
