import { Router } from 'express'
import { userController } from '@/controllers/user.controller'
import { verifyToken } from '@/middlewares/jwt.middleware'

const router = Router()

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/profile', verifyToken, userController.profile)
router.get('/', userController.findAllUsers)
router.post(
  '/resend-verification-email',
  userController.resendVerificationEmail,
)

router.get('/verify-account', userController.verifyEmail)

//Rutas de recuperacion de contraseña
router.post('/forgot-password', userController.sendEmailResetPassword)
router.put('/reset-password', userController.resetPassword)

//Rutas de actualizacion de perfil
router.put('/update-photo-profile', userController.updatePhotoProfile) // poner middleware

export default router
