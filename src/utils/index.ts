export function generateOTP(): string {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
} 
//gera um código OTP aleatório de 6 dígitos.