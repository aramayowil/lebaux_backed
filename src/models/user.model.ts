import pool from '../database/conection.database'
import IUser from '../interface/IUser'

//parametrizando consultas para evitar inyeccion sql

const createUser = async ({
  email,
  nombre,
  apellido,
  rol,
  is_verified,
  password_hash,
}: IUser) => {
  const query = {
    text: 'INSERT INTO users.tb_users (email, nombre, apellido, rol, is_verified, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING email, nombre, apellido, rol, is_verified',
    values: [
      email,
      nombre,
      apellido,
      rol || 'user',
      is_verified || false,
      password_hash,
    ],
  }
  const result = await pool.query(query)
  return result.rows[0]
}

//funcion para verificar un usuario a traves de su email
const verifyUserEmail = async (email: string): Promise<IUser | undefined> => {
  const query = {
    text: 'UPDATE users.tb_users SET is_verified = true WHERE email = $1',
    values: [email],
  }
  const result = await pool.query(query)
  return result.rows[0]
}

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
  verifyUserEmail,
}
