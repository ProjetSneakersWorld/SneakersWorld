import jwt from "jsonwebtoken";
import {serialize} from "cookie";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {pseudo} = req.body;
        console.log("recu pseudo : "+pseudo)
        try {
            const token = jwt.sign({pseudo}, 'secret_key', {expiresIn: '24h'});
            // Définissez le cookie avec le token
            res.setHeader('Set-Cookie', [serialize('TOKEN', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            }), serialize('Pseudo', "me", {
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            })]);
            res.status(200).json({message: 'Success'});
        } catch (error) {
            console.log("erreur : " + error)
        }
    } else {
        // Gérer les autres méthodes HTTP
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

