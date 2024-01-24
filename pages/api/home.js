// pages/api/login.js
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import bcrypt from "bcrypt";
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { idf, mdp } = req.body;

        try {
            // Récupérez l'utilisateur de la base de données
            const { data: user, error } = await supabase
                .from('connexion')
                .select('*')
                .eq('pseudo', idf) // Utiliser le champ correct pour l'identifiant
                .single();

            console.log("hi, "+user.name);

            if (error || !user) {
                return res.status(401).json({ error: "identifiant ou mot de passe incorrect" });
            }
            // Comparez le mot de passe avec le mot de passe haché stocké dans la base de données
            if (bcrypt.compareSync(mdp, user.mdp)) {
                // Authentification réussie : Générez un token
                const token = jwt.sign({ idf }, 'secret_key', { expiresIn: '24h' });
                // Définissez le cookie avec le token
                res.setHeader('Set-Cookie', [serialize('TOKEN', token, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    maxAge: 3600,
                    path: '/',
                }),serialize('name', user.name,{
                        httpOnly: false,
                        secure: process.env.NODE_ENV !== 'development',
                        sameSite: 'strict',
                        maxAge: 3600,
                        path: '/',
                    }
                )]);
                res.status(200).json({ success: true, pseudo: user.name });
            } else {
                // Échec de l'authentification
                res.status(401).json({ error: "identifiant ou mot de passe incorrect" });
            }
        } catch (error) {
            // Gestion des erreurs lors de la connexion à la base de données
            console.error(error);
            res.status(500).json({ error: "Une erreur s'est produite lors de la connexion à la base de données" });
        }
    } else {
        // Gérer les autres méthodes HTTP
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
