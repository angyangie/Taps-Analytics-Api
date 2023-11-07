import jwt from 'jsonwebtoken';

// Alternative to generating more secure tokens - not used in our analytics example
const SECRET = process.env.SECRET

export function generateJWT(payload: any): string {
    return jwt.sign(payload, SECRET, { expiresIn: '365d' }); // Expires in 365 days, adjust as needed
}

export function verifyJWT(token: string): any {
    return jwt.verify(token, SECRET);
}