// Requisitos para tu Nombre de Usuario
// Para crear tu cuenta, el nombre de usuario debe cumplir con las siguientes reglas:
// Longitud: Debe tener entre 3 y 20 caracteres.
// Caracteres permitidos: Puedes usar letras (mayúsculas o minúsculas), números, puntos (.) y guiones bajos (_).
// Reglas de posición: * No puede empezar ni terminar con un punto (.) o un guion bajo (_).
// Reglas de formato: * No se permiten símbolos seguidos (por ejemplo, no puedes usar .. o __ o ._).

const validateUsername = (username: string): boolean => {
  // Reglas: 3-20 caracteres, letras, números, puntos o guiones bajos.
  // No puede empezar ni terminar con un punto.
  const regex = /^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
  return regex.test(username)
}

export default validateUsername
