// Requisitos de Seguridad de tu Contraseña
// Para que tu cuenta esté protegida, la contraseña debe cumplir con los siguientes criterios:
// Longitud: Debe tener entre 6 y 20 caracteres.
// Mayúsculas: Al menos una letra mayúscula (A-Z).
// Minúsculas: Al menos una letra minúscula (a-z).
// Números: Al menos un dígito (0-9).
// Caracteres especiales: Al menos uno de los siguientes símbolos:
// ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; : ' " , . < > / ? | \ ~ ` ñ Ñ

interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = []

  // 1. Longitud (Obligatorio)
  if (password.length < 6 || password.length > 20) {
    errors.push('Debe tener entre 6 y 20 caracteres.')
  }

  // 2. Complejidad Alfanumérica (Obligatorio)
  if (!/[A-Z]/.test(password)) errors.push('Incluye al menos una mayúscula.')
  if (!/[a-z]/.test(password)) errors.push('Incluye al menos una minúscula.')
  if (!/\d/.test(password)) errors.push('Incluye al menos un número.')

  // 3. Validación de Caracteres Permitidos
  const allowedCharsRegex =
    /^[A-Za-z0-9!@#\$%\^&\*\(\)_\+\-=\[\]\{\};:'",\.<>\/\?|\\~`ñÑ]*$/

  if (!allowedCharsRegex.test(password)) {
    errors.push('Contiene caracteres no permitidos.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export default validatePassword
