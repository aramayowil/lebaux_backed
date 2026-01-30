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
  // Ajustes de estabilidad para Vercel
  max: 2, // Permitimos hasta 2 para dar margen de error
  connectionTimeoutMillis: 15000, // 15 segundos (más paciencia)
  idleTimeoutMillis: 1000, // Cerramos rápido las conexiones inactivas
})

pool
  .connect()
  .then(() => console.log('DATABASE connected'))
  .catch((error) => console.log('DATABASE connection error', error))

export default pool
