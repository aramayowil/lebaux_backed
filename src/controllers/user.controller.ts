import { UserModel } from '../models/user.model'
import { Request, Response } from 'express'
import validateEmail from '../utils/Regex/emailRegex'
import validatePassword from '../utils/Regex/PasswordRegex'
import { hashPassword } from '../utils/functions/hashedPassword'
import generateAuthToken from '@/utils/functions/generateToken'
import comparePassword from '@/utils/functions/comparePassword'
import IUser from '../interface/IUser'
import { validateName } from '@/utils/Regex/nameRegex'
import {
  sendWelcomeEmail,
  sendResetPasswordEmail,
} from '@/services/email.service'
import { generateVerificationData } from '@/utils/token.utils'

//funcion para registrar un usuario

const register = async (req: Request, res: Response) => {
  try {
    //validaciones correspondintes de seguridad
    const body = req.body as IUser
    // Validación de tipos y existencia
    const requiredFields: (keyof IUser)[] = [
      'email',
      'nombre',
      'apellido',
      'password',
    ]
    // "Busca si algún campo requerido no está presente o no es del tipo correcto"
    const missingField = requiredFields.find(
      (field) => !req.body[field] || typeof req.body[field] !== 'string',
    )

    if (missingField) {
      return res.status(400).json({
        ok: false,
        message: `El campo '${missingField}' es requerido`,
        error: `Field '${missingField}' is required`,
      })
    }

    const { email, nombre, apellido, password } = body

    const cleanEmail = email.trim().toLowerCase()
    const cleanNombre = nombre.trim().toLowerCase()
    const cleanApellido = apellido.trim().toLowerCase()

    const existsEmail = await UserModel.findUserByEmail(cleanEmail)

    if (!validateEmail(cleanEmail)) {
      return res
        .status(400)
        .json({ ok: false, message: 'Correo invalido', error: 'Invalid email' })
    }
    if (!validateName(cleanNombre)) {
      return res
        .status(400)
        .json({ ok: false, message: 'Nombre invalido', error: 'Invalid name' })
    }
    if (!validateName(cleanApellido)) {
      return res.status(400).json({
        ok: false,
        message: 'Apellido invalido',
        error: 'Invalid last name',
      })
    }

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        ok: false,
        message: 'Contraseña invalida',
        error: 'Invalid password',
      })
    }
    if (existsEmail) {
      return res.status(409).json({
        ok: false,
        message: 'Correo ya registrado',
        error: 'Email already registered',
      })
    }

    //Generar token de 24 horas
    const { vToken, expiration } = generateVerificationData()
    //Hashear la contraseña
    const hashedPassword = await hashPassword(password)

    const finalRol: 'admin' | 'user' = 'user'
    const finalIsVerified: boolean = false

    const newUser: IUser = await UserModel.createUser({
      email: cleanEmail,
      nombre: cleanNombre,
      apellido: cleanApellido,
      role: finalRol,
      is_verified: finalIsVerified,
      password: hashedPassword,
      verification_token: vToken,
      token_expires_at: expiration,
    })

    sendWelcomeEmail(newUser.email, newUser.nombre, vToken).then((response) => {
      if (!response.success) {
        console.error('Error enviando email:', response.error)
      }
    })

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado con éxito. Revisa tu correo.',
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error en el registro',
      error: 'Internal server error',
    })
  }
}

//funcion para reenviar correo de verificacion
const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (email && typeof email !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'El formato del correo es invalido',
        error: 'Invalid email format',
      })
    }

    if (!email)
      return res.status(400).json({
        ok: false,
        message: 'Email es requerido',
        error: 'Email is required',
      })

    const user = await UserModel.findUserByEmail(email.trim().toLowerCase())

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
        error: 'User not found',
      })
    }

    if (user.is_verified) {
      return res.status(400).json({
        ok: false,
        message: 'Esta cuenta ya ha sido verificada.',
        error: 'Account already verified',
      })
    }

    //generamos nuevo token
    const { vToken, expiration } = generateVerificationData()
    //guardamos en DB el nuevo token
    await UserModel.updateVerificationToken(user.usuario_id, vToken, expiration)

    const emailResponse = await sendWelcomeEmail(
      user.email,
      user.nombre,
      vToken,
    )

    if (!emailResponse.success) {
      return res.status(500).json({
        ok: false,
        message: 'Error al enviar el correo',
        error: emailResponse.error,
      })
    }

    res.status(200).json({
      ok: true,
      message: 'Correo de verificación reenviado con éxito.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: 'Internal server error',
    })
  }
}

//funcion para verificar un usuario a traves de su email
const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, vToken } = req.query

    if (!email || !vToken) {
      return res.status(400).json({
        ok: false,
        message: 'El enlace de verificación es inválido o ha expirado.',
        error: 'INVALID_LINK',
      })
    }

    const user = await UserModel.findUserByEmail(
      email.toString().trim().toLowerCase(),
    )

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: 'USER_NOT_FOUND',
        message: 'No se encontró un usuario asociado a este correo.',
      })
    }

    if (user.is_verified) {
      return res.status(200).json({
        ok: true,
        message: 'Esta cuenta ya ha sido verificada. ¡Puedes iniciar sesión!',
      })
    }

    //VALIDACIÓN DE SEGURIDAD: Comparar tokens y fecha de expiración
    const now = new Date()

    if (user.verification_token !== vToken) {
      return res.status(400).json({
        ok: false,
        message: 'El código de verificación no es válido para este correo.',
        error: 'INVALID_TOKEN',
      })
    }

    if (user.token_expires_at && now > new Date(user.token_expires_at)) {
      return res.status(410).json({
        ok: false,
        message:
          'El enlace ha expirado. Por favor, solicita uno nuevo iniciando sesion.',
        error: 'TOKEN_EXPIRED',
      })
    }

    //Actualizar usuario a verificado
    await UserModel.verifyUserAndClearToken(user.usuario_id)

    res.status(200).json({
      ok: true,
      user,
      message: 'Email verificado con éxito. Ya puedes iniciar sesión.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      ok: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor',
    })
  }
}
//funcion para iniciar sesión

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    //validacion del email
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email y/o contraseña inválidos' })
    }
    //limpiamos espacios en blanco del email y lo convertimos a minusculas para evitar errores de tipeo
    const cleanEmail = email.trim().toLowerCase()

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        message: 'Email no tiene un formato valido',
        error: 'Email not valid',
      })
    }

    const user = await UserModel.findUserByEmail(cleanEmail)

    const isMatch = user
      ? await comparePassword(password, user.password)
      : false

    if (!isMatch || !user) {
      return res.status(401).json({
        ok: false,
        message: 'Email y/o contraseña incorrectos',
        error: 'Email or password invalid',
      })
    }

    if (!user.is_verified) {
      const { vToken, expiration } = generateVerificationData()
      await UserModel.updateVerificationToken(
        user.usuario_id,
        vToken,
        expiration,
      )

      sendWelcomeEmail(user.email, user.nombre, vToken).then((response) => {
        if (!response.success) {
          console.error('Error enviando email:', response.error)
        }
      })
      return res.status(403).json({
        ok: false,
        data: { email: user.email, nombre: user.nombre },
        message:
          'Tu cuenta no está verificada. Te hemos enviado un nuevo enlace de activación.',
        error: 'Email not verified',
      })
    }

    const auth_token = generateAuthToken(user)

    res.status(200).json({
      ok: true,
      message: 'Login exitoso',
      auth_token,
      user: {
        id: user.usuario_id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ ok: false, message: 'Error en el login', error: error })
  }
}

//profile
const profile = async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    const user = await UserModel.findUserByEmail(email)
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
        error: 'User not found',
      })
    }
    res.status(200).json({ ok: true, message: 'Perfil del usuario', user })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ ok: false, message: 'Error en el perfil', error: error })
  }
}

//funcion para obtener todos los usuarios
const findAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAllUsers()
    res.status(200).json({ ok: true, message: 'Usuarios encontrados', users })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error en la busqueda de usuarios',
      error: 'Internal server error',
    })
  }
}

const sendEmailResetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!validateEmail(email) || typeof email !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'Email no tiene un formato valido',
        error: 'Email not valid',
      })
    }
    const user = await UserModel.findUserByEmail(email)
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
        error: 'User not found',
      })
    }
    const { vToken, expiration } = generateVerificationData()
    await UserModel.updateVerificationToken(user.usuario_id, vToken, expiration)
    sendResetPasswordEmail(user.email, user.nombre, vToken).then((response) => {
      if (!response.success) {
        console.error('Error enviando email:', response.error)
      }
    })
    res.status(200).json({
      ok: true,
      message: 'Correo de recuperación enviado con éxito.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: 'Internal server error',
    })
  }
}

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, vToken, new_password } = req.body

    if (!email || !vToken || !new_password) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan datos',
        error: 'Missing data',
      })
    }
    if (
      typeof email !== 'string' ||
      typeof vToken !== 'string' ||
      typeof new_password !== 'string'
    ) {
      return res.status(400).json({
        ok: false,
        message: 'tipo de datos inválidos',
        error: 'Invalid data type',
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Email no tiene un formato valido',
        error: 'Email not valid',
      })
    }
    if (!validatePassword(new_password)) {
      return res.status(400).json({
        ok: false,
        message: 'Contraseña no tiene un formato valido',
        error: 'Password not valid',
      })
    }

    const user = await UserModel.findUserByEmail(email)
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
        error: 'User not found',
      })
    }

    if (user.verification_token !== vToken) {
      return res.status(400).json({
        ok: false,
        message: 'Token de verificación no válido',
        error: 'Invalid verification token',
      })
    }
    if (user.token_expires_at && user.token_expires_at < new Date()) {
      return res.status(400).json({
        ok: false,
        message: 'Token de verificación expirado',
        error: 'Verification token expired',
      })
    }
    const hashedPassword = await hashPassword(new_password)

    //actualizamos contraseña primero
    await UserModel.updatePassword(user.usuario_id, hashedPassword)

    //luego verificamos el usuario y limpiamos el token
    await UserModel.verifyUserAndClearToken(user.usuario_id)

    res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada con éxito.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: 'Internal server error',
    })
  }
}

export const userController = {
  register,
  login,
  profile,
  findAllUsers,
  resendVerificationEmail,
  verifyEmail,
  sendEmailResetPassword,
  resetPassword,
}
