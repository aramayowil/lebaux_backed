import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.routes'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 4000

//Routes
app.use('/api/users', userRoutes)

//Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
