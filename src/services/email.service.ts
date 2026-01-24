import dotenv from 'dotenv'
dotenv.config()
import { Resend } from 'resend'
import { capitalize } from '@/utils/functions/capitalize'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWelcomeEmail = async (
  email: string,
  nombre: string,
  vToken: string,
) => {
  try {
    const verifyLink = `http://localhost:4000/api/users/verify?email=${email}&vToken=${vToken}`
    const { data, error } = await resend.emails.send({
      from: 'Lebaux <onboarding@resend.dev>',
      to: [email],
      subject: '¡Bienvenido a Lebaux!',
      html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Language" content="es">
            <style>
              .button:hover { background-color: #333333 !important; }
            </style>
            <title>Verifica tu cuenta en Lebaux</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9f9f9; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <tr>
                      <td align="center" style="padding: 40px 0 20px 0;">
                        <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; color: #000;">LEBAUX</h1>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">¡Casi listo, ${capitalize(nombre)}!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                          Gracias por unirte a Lebaux. Para activar tu cuenta y comenzar tu experiencia, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón.
                        </p>
                        
                        <a href="${verifyLink}" class="button" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 16px 32px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                          Verificar mi cuenta
                        </a>
                        
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                          Este enlace expirará en 24 horas. Si no creaste una cuenta en Lebaux, puedes ignorar este correo.
                        </p>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                          © 2026 Lebaux Store. Todos los derechos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
