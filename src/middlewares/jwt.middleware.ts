import 'dotenv/config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import IUser from '@/interface/IUser';

interface AuthRequest extends Request {
    user?: Partial<IUser>;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {

    const token = req.headers.authorization

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' })
    }
    const tokenValue = token.split(' ')[1]

    try {
        const password_secret = process.env.JWT_SECRET as string;
        // jwt.verify devuelve string | JwtPayload, forzamos a JwtPayload para acceder a properties
        const decoded = jwt.verify(tokenValue, password_secret) as JwtPayload
        // Inicializa req.user en lugar de asignar una propiedad a undefined
        req.user = {
            email: decoded.email
            // Añade aquí más campos si vienen en el token, ej: uid: decoded.uid
        };
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Failed to authenticate token' })
    }
}