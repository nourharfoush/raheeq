import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tahfez-secret-key-change-in-prod';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void | Response {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للوصول إلى هذا المورد' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
    return;
  } catch (error) {
    return res.status(403).json({ error: 'رمز الجلسة غير صالح أو منتهي الصلاحية' });
  }
}

export function authorize(roles: Array<'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للوصول إلى هذا المورد' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك الصلاحية الكافية للوصول إلى هذا المورد' });
    }

    next();
    return;
  };
}
