import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.routes'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Routes
app.use('/api/users', userRoutes)

const PORT: number = Number(process.env.PORT) || 4000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
