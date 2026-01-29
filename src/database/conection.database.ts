import dotenv from 'dotenv'
dotenv.config()
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

try {
  await pool.connect()
  console.log('DATABASE connected')
} catch (error) {
  console.log('DATABASE connection error', error)
}
export default pool
