import { UserModel } from '../models/user.model'
import { Request, Response } from 'express'
import validateEmail from '../utils/Regex/emailRegex'
import validatePassword from '../utils/Regex/PasswordRegex'
import { hashPassword } from '../utils/functions/hashedPassword'
import generateToken from '@/utils/functions/generateToken'
import comparePassword from '@/utils/functions/comparePassword'
import IUser from '../interface/IUser'
import { validateName } from '@/utils/Regex/nameRegex'
import { sendWelcomeEmail } from '@/services/email.service'

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
      'password_hash',
    ]
    // "Busca si algún campo requerido no está presente o no es del tipo correcto"
    const missingField = requiredFields.find(
      (field) => !req.body[field] || typeof req.body[field] !== 'string',
    )

    if (missingField) {
      return res.status(400).json({
        error: `Field '${missingField}' is missing or invalid`,
      })
    }

    const { email, nombre, apellido, password_hash } = body

    const cleanEmail = email.trim().toLowerCase()
    const cleanNombre = nombre.trim().toLowerCase()
    const cleanApellido = apellido.trim().toLowerCase()

    const existsEmail = await UserModel.findUserByEmail(cleanEmail)

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email' })
    }
    if (!validateName(cleanNombre)) {
      return res.status(400).json({ error: 'Invalid name' })
    }
    if (!validateName(cleanApellido)) {
      return res.status(400).json({ error: 'Invalid last name' })
    }

    const passwordCheck = validatePassword(password_hash)
    if (!passwordCheck.isValid) {
      return res.status(400).json({ error: 'Invalid password' })
    }
    if (existsEmail) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const hashedPassword = await hashPassword(password_hash)

    const finalRol: 'admin' | 'user' = 'user'
    const finalIsVerified: boolean = false

    const newUser = await UserModel.createUser({
      email: cleanEmail,
      nombre: cleanNombre,
      apellido: cleanApellido,
      rol: finalRol,
      is_verified: finalIsVerified,
      password_hash: hashedPassword,
    })

    sendWelcomeEmail(newUser.email, newUser.nombre).then((response) => {
      if (!response.success) {
        console.error('Error enviando email:', response.error)
      }
    })

    const token = generateToken(newUser)

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado con éxito. Revisa tu correo.',
      newUser,
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ ok: false, message: 'Error en el registro' })
  }
}

//funcion para reenviar correo de verificacion
const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) return res.status(400).json({ error: 'Email es requerido' })

    const user = await UserModel.findUserByEmail(email.trim().toLowerCase())

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.is_verified) {
      return res
        .status(400)
        .json({ error: 'Esta cuenta ya ha sido verificada.' })
    }
    const emailResponse = await sendWelcomeEmail(user.email, user.nombre)

    if (!emailResponse.success) {
      return res.status(500).json({
        error: 'Error al enviar el correo',
        details: emailResponse.error,
      })
    }

    res.status(200).json({
      ok: true,
      message: 'Correo de verificación reenviado con éxito.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
}

//funcion para verificar un usuario a traves de su email
const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_LINK',
        message: 'El enlace de verificación es inválido o ha expirado.',
      })
    }

    const user = await UserModel.verifyUserEmail(
      email.toString().trim().toLowerCase(),
    )

    if (user && user.is_verified) {
      return res.status(200).json({
        ok: true,
        message:
          'Esta cuenta ya ha sido verificada anteriormente. ¡Puedes loguearte!',
      })
    }

    if (user) {
      return res.status(200).json({
        ok: true,
        message: 'Email verificado con éxito. Ya puedes iniciar sesión.',
      })
    } else {
      return res.status(404).json({
        ok: false,
        error: 'USER_NOT_FOUND',
        message: 'No se encontró el usuario o la cuenta ya ha sido activada.',
      })
    }
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
      return res
        .status(400)
        .json({ error: 'Email and password must be strings' })
    }
    //limpiamos espacios en blanco del email y lo convertimos a minusculas para evitar errores de tipeo
    const cleanEmail = email.trim().toLowerCase()

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email' })
    }

    const user = await UserModel.findUserByEmail(cleanEmail)

    const isMatch = user
      ? await comparePassword(password, user.password_hash)
      : false

    if (!isMatch || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.is_verified) {
      return res.status(403).json({
        ok: false,
        error: 'EMAIL_NOT_VERIFIED',
        message:
          'Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.',
      })
    }

    const token = generateToken(user)

    res
      .status(200)
      .json({ ok: true, message: 'User logged in successfully', token })
  } catch (error) {
    console.log(error)
    res.status(500).json({ ok: false, message: 'Error en el login' })
  }
}

//profile
const profile = async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    const user = await UserModel.findUserByEmail(email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ ok: true, message: 'User profile', user })
  } catch (error) {
    console.log(error)
    res.status(500).json({ ok: false, message: 'Error en el perfil' })
  }
}

//funcion para obtener todos los usuarios
const findAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAllUsers()
    res.status(200).json({ ok: true, message: 'Users found', users })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ ok: false, message: 'Error en la busqueda de usuarios' })
  }
}

export const userController = {
  register,
  login,
  profile,
  findAllUsers,
  resendVerificationEmail,
  verifyEmail,
}
