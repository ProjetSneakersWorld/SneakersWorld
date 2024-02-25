import jwt from "jsonwebtoken";
import {serialize} from "cookie";
import moment from "moment-timezone";
import { supabase } from './supabaseClient'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {pseudo} = req.body;
        // console.log("recu pseudo : "+pseudo)
        try {
            const token = jwt.sign({pseudo}, 'secret_key', {expiresIn: '24h'});
            // Définissez le cookie avec le token
            res.setHeader('Set-Cookie', [serialize('TOKEN', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            }), serialize('Pseudo', pseudo, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            })]);
            //mettre a jour la date de dateOnline
            try {
                const { error } = await supabase
                    .from('connexion')
                    .update({
                        dateOnline: moment().tz('Europe/Paris').format(),
                    })
                    .eq('pseudo', pseudo); // Met à jour uniquement les lignes où le pseudo est 'admin'
                if (error) {
                    console.error("Une erreur s'est produite : ", error);
                } else {
                    res.status(200).json({message: 'Success'});
                    console.log("Mise à jour réussie de la dateOnline");
                }
            } catch (error) {
                console.error("Une erreur s'est produite : ", error);
            }
        } catch (error) {
            console.log("erreur : " + error)
        }
    } else {
        // Gérer les autres méthodes HTTP
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

