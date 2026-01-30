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
  // AJUSTES PARA VERCEL Y POOLER:
  max: 1, // Mantenemos 1 para no saturar el pooler gratuito
  connectionTimeoutMillis: 10000, // Subimos a 10 segundos (Vercel a veces es lento al arrancar)
  idleTimeoutMillis: 10000, // No lo dejes en 0, permite que la conexión se cierre si no se usa
})

pool
  .connect()
  .then(() => console.log('DATABASE connected'))
  .catch((error) => console.log('DATABASE connection error', error))

export default pool
