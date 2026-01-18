import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
})

try {
  await pool.connect()
  console.log('DATABASE connected')
} catch (error) {
  console.log('DATABASE connection error', error)
}
export default pool
