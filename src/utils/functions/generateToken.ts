import 'dotenv/config'
import jwt from 'jsonwebtoken'
import IUser from '../../interface/IUser'

const generateToken = (user: IUser) => {
  // Verificamos que la clave secreta exista
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno')
  }

  return jwt.sign({ id: user.uid }, secret, { expiresIn: '1h' })
}

export default generateToken
