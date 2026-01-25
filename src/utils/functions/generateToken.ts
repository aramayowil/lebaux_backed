import 'dotenv/config'
import jwt from 'jsonwebtoken'
import IUser from '../../interface/IUser'

const generateToken = (user: IUser) => {
  // Verificamos que la clave secreta exista
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno')
  }

  const payload = {
    id: user.usuario_id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, secret, { expiresIn: '8h' })
}

export default generateToken
