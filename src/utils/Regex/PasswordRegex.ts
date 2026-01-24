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
  const secureRegex =
    /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[!@#$%^&*()_+=\-\[\]{};:'",.<>\/?|\\~`])[A-Za-z0-9!@#$%^&*()_+=\-\[\]{};:'",.<>\/?|\\~`ñÑ]{6,100}$/

  const isValid = secureRegex.test(password)

  return {
    isValid,
    errors: isValid
      ? []
      : [
          'La contraseña no cumple con los requisitos de seguridad (mayúsculas, minúsculas, números, caracteres especiales y longitud 6-100).',
        ],
  }
}

export default validatePassword
