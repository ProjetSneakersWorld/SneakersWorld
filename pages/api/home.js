// pages/api/login.js
import jwt from 'jsonwebtoken';
import {serialize} from 'cookie';
import bcrypt from "bcrypt";
import moment from "moment-timezone";
import { supabase } from './supabaseClient'



export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {idf, mdp} = req.body;

        try {
            // Récupérez l'utilisateur de la base de données
            const {data: user, error} = await supabase
                .from('connexion')
                .select('*')
                .eq('pseudo', idf) // Utiliser le champ correct pour l'identifiant
                .single();

            if (error || !user) {
                console.log('User not found or error querying the database');
                return res.status(401).json({error: "identifiant ou mot de passe incorrect"});
            }

            // Comparez le mot de passe avec le mot de passe haché stocké dans la base de données
            if (bcrypt.compareSync(mdp, user.mdp)) {
                // Authentification réussie : Générez un token
                const token = jwt.sign({idf}, 'secret_key', {expiresIn: '24h'});
                // Définissez le cookie avec le token
                res.setHeader('Set-Cookie', [serialize('TOKEN', token, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    maxAge: 3600,
                    path: '/',
                }), serialize('Pseudo', user.pseudo, {
                        httpOnly: false,
                        secure: process.env.NODE_ENV !== 'development',
                        sameSite: 'strict',
                        maxAge: 3600,
                        path: '/',
                    }
                )]);
                // //upadte date
                try {
                    const { data, error } = await supabase
                        .from('connexion')
                        .update({
                            dateOnline: moment().tz('Europe/Paris').format(),
                        })
                        .eq('pseudo', idf); // Met à jour uniquement les lignes où le pseudo est 'admin'
                    if (error) {
                        console.error("Une erreur s'est produite : ", error);
                    } else {
                        console.log("Mise à jour réussie de la dateOnline");
                    }
                } catch (error) {
                    console.error("Une erreur s'est produite : ", error);
                }

                res.status(200).json({success: true, pseudo: user.name});
            } else {
                // Échec de l'authentification
                console.log('Password does not match');
                res.status(401).json({error: "identifiant ou mot de passe incorrect"});
            }
        } catch (error) {
            // Gestion des erreurs lors de la connexion à la base de données
            console.error(error);
            res.status(500).json({error: "Une erreur s'est produite lors de la connexion à la base de données"});
        }
    } else {
        // Gérer les autres méthodes HTTP
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
