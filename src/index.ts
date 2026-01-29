import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.routes'
import path from 'path'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Routes
app.use('/api/users', userRoutes)

app.get('/', (req, res) => {
  res.send('API de Lebaux funcionando correctamente 🚀')
})

app.get('/favicon.png', (req, res) => {
  const pathLogo = path.join(process.cwd(), 'favicon.png')
  res.sendFile(pathLogo)
})

const PORT: number = Number(process.env.PORT) || 4000

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`))
}

export default app
