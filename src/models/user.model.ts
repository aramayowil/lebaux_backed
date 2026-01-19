import pool from '../database/conection.database'
import IUser from '../interface/IUser'

//parametrizando consultas para evitar inyeccion sql

const createUser = async ({ email, username, password }: IUser) => {
  const query = {
    text: 'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING email, username',
    values: [email, username, password],
  }
  const result = await pool.query(query)
  return result.rows[0]
}

const findAllUsers = async (): Promise<IUser[]> => {
  const query = {
    text: 'SELECT * FROM users',
  }
  const { rows } = await pool.query(query)
  return rows
}

const findUserByEmail = async (email: string): Promise<IUser | undefined> => {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  }
  const result = await pool.query(query)
  return result.rows[0]
}

const findUserByUsername = async (
  username: string,
): Promise<IUser | undefined> => {
  const query = {
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username],
  }
  const result = await pool.query(query)
  return result.rows[0]
}

export const UserModel = {
  createUser,
  findAllUsers,
  findUserByEmail,
  findUserByUsername,
}
