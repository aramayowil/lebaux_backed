import dotenv from 'dotenv'
dotenv.config()
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWelcomeEmail = async (email: string, nombre: string) => {
  try {
    // En desarrollo, apuntamos a tu servidor local
    // Si usas el puerto 4000, cámbialo aquí
    const verifyLink = `http://localhost:4000/api/users/verify?email=${email}`
    const { data, error } = await resend.emails.send({
      from: 'Lebaux <onboarding@resend.dev>',
      to: [email],
      subject: '¡Bienvenido a Lebaux!',
      html: `
        <h1>Hola, ${nombre}</h1>
        <p>Haz clic abajo para verificar tu cuenta:</p>
        <a href="${verifyLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verificar Mi Cuenta
        </a>
      `,
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    return { success: false, error: err }
  }
}
