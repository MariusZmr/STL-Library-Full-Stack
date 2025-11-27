import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or token is not Bearer type.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // The decoded payload is attached to the request object.
    // The 'user' property on Request was defined in 'backend/src/types/express.d.ts'
    req.user = decoded as { id: string; email: string };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

export default authMiddleware;
