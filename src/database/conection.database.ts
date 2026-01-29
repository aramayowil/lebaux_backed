import dotenv from 'dotenv'
dotenv.config()
import { Pool } from 'pg'

console.log('¿Existe la variable?:', !!process.env.DATABASE_URL)
if (process.env.DATABASE_URL) {
  console.log('Inicio de la URL:', process.env.DATABASE_URL.substring(0, 15))
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Configuraciones óptimas para el modo Transaction de Supabase
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 5000,
})

pool
  .connect()
  .then(() => console.log('DATABASE connected'))
  .catch((error) => console.log('DATABASE connection error', error))

export default pool
