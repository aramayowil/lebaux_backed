export default interface IUser {
  usuario_id: number
  email: string
  nombre: string
  apellido: string
  password_hash: string
  rol?: 'admin' | 'user' // Opcional para facilitar el registro
  verification_token?: string | null
  token_expires_at?: Date | null
  welcome_shown?: boolean
  last_version_seen?: string
  last_login?: Date | null // Nullable si nunca ha iniciado sesión
  is_verified?: boolean
  readonly fecha_creacion?: Date // Cambiado a Date para coincidir con el driver de PG o prisma
}
