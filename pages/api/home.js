// pages/api/home.js
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import bcrypt from "bcrypt";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { idf, mdp } = req.body;
        // Récupérez l'identifiant et le mot de passe haché des variables d'environnement
        const hashedPassword = bcrypt.hashSync(process.env.HASH_MDP, 12);

        // Comparez l'identifiant et le mot de passe avec les valeurs stockées
        if (idf === process.env.IDF && bcrypt.compareSync(mdp, hashedPassword)) {
            // Authentification réussie : Générez un token
            const token = jwt.sign({ idf }, 'secret_key', { expiresIn: '24h' });
            // Définissez le cookie avec le token
            res.setHeader('Set-Cookie', [serialize('TOKEN', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            })]);
            res.status(200).json({ success: true });
        } else {
            // Échec de l'authentification
            res.status(401).json({ error: "identifiant ou mot de passe incorrect" });
        }
    } else {
        // Gérer les autres méthodes HTTP
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
