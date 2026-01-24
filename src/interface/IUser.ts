export default interface IUser {
  usuario_id?: number
  email: string
  nombre: string
  apellido: string
  password_hash: string
  rol: 'admin' | 'user'
  is_verified?: boolean
  readonly fecha_creacion?: string //solo lectura
}
