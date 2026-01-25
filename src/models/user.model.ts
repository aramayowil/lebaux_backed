import pool from '../database/conection.database'
import IUser from '../interface/IUser'

//parametrizando consultas para evitar inyeccion sql

const createUser = async ({
  email,
  nombre,
  apellido,
  role,
  is_verified,
  password_hash,
  verification_token,
  token_expires_at,
}: Omit<IUser, 'usuario_id'>): Promise<IUser> => {
  const query = {
    text: 'INSERT INTO users.tb_users (email, nombre, apellido, rol, is_verified, password_hash, verification_token, token_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING usuario_id, email, nombre, apellido, rol, is_verified',
    values: [
      email,
      nombre,
      apellido,
      role || 'user',
      is_verified || false,
      password_hash,
      verification_token,
      token_expires_at,
    ],
  }
  const result = await pool.query(query)
  return result.rows[0] as IUser
}

const updateUserVerification = async (usuario_id: number): Promise<void> => {
  const query = {
    text: `
    UPDATE users.tb_users 
    SET 
      is_verified = true, 
      verification_token = NULL, 
      token_expires_at = NULL,
      updated_at = NOW()
    WHERE usuario_id = $1
  `,
    values: [usuario_id],
  }

  try {
    // Ejecutamos la consulta pasando el ID del usuario
    await pool.query(query)
  } catch (error) {
    console.error('Error al actualizar la verificación en DB:', error)
    throw new Error('Database update failed')
  }
}


// Actualiza el token para reenvíos (mantiene is_verified = false)
const updateVerificationToken = async (
  usuario_id: number,
  token: string,
  expiresAt: Date
): Promise<void> => {
  const query = {
    text: `
      UPDATE users.tb_users 
      SET 
        verification_token = $1, 
        token_expires_at = $2,
        updated_at = NOW()
      WHERE usuario_id = $3
    `,
    values: [token, expiresAt, usuario_id],
  }

  try {
    await pool.query(query);
  } catch (error) {
    console.error('Error al actualizar el token de verificación:', error)
    throw new Error('Database update failed')
  }
};

const findAllUsers = async (): Promise<IUser[]> => {
  const query = {
    text: 'SELECT * FROM users.tb_users',
  }
  const { rows } = await pool.query(query)
  return rows
}

const findUserByEmail = async (email: string): Promise<IUser | undefined> => {
  const query = {
    text: 'SELECT * FROM users.tb_users WHERE email = $1',
    values: [email],
  }
  const result = await pool.query(query)
  return result.rows[0]
}

export const UserModel = {
  createUser,
  findAllUsers,
  findUserByEmail,
  updateUserVerification,
  updateVerificationToken,
}
