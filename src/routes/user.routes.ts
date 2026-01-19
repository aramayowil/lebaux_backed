import { Router } from 'express'
import { userController } from '@/controllers/user.controller'
import { verifyToken } from '@/middlewares/jwt.middleware'

const router = Router()

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/profile', verifyToken, userController.profile)

export default router
