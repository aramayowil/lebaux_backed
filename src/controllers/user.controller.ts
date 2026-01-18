import { UserModel } from '../models/user.model'
import { Request, Response } from 'express'
import validateEmail from '../utils/Regex/emailRegex'
import validateUsername from '../utils/Regex/usernameRegex'
import validatePassword from '../utils/Regex/PasswordRegex'
import { hashPassword } from '../utils/functions/hashedPassword'
import generateToken from '@/utils/functions/generateToken'
import comparePassword from '@/utils/functions/comparePassword'

//funcion para registrar un usuario

const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body

    //validaciones correspondintes de seguridad

    // Validación de tipos y existencia
    if (
      typeof email !== 'string' ||
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return res
        .status(400)
        .json({ error: 'All fields are required and must be strings' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanUsername = username.trim()

    const existsEmail = await UserModel.findUserByEmail(cleanEmail)
    const existsUsername = await UserModel.findUserByUsername(cleanUsername)

    if (!cleanEmail || !cleanUsername || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email' })
    }
    if (!validateUsername(cleanUsername)) {
      return res.status(400).json({ error: 'Invalid username' })
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid password' })
    }
    if (existsEmail) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    if (existsUsername) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await UserModel.createUser({
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
    })

    const token = generateToken(newUser)

    res
      .status(201)
      .json({ ok: true, message: 'User created successfully', newUser, token })
  } catch (error) {
    console.log(error)
    res.status(500).json({ ok: false, message: 'Error en el registro' })
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
      ? await comparePassword(password, user.password)
      : false

    if (!isMatch || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
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

export const userController = {
  register,
  login,
}
