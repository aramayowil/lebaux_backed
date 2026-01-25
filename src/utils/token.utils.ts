import crypto from 'crypto';

export const generateVerificationData = () => {
    const vToken = crypto.randomBytes(32).toString('hex');

    // Seteamos la expiración (8 horas en tu caso)
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 8);

    return { vToken, expiration };
};