import bcrypt from 'bcrypt'

const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}

export default comparePassword
