// pages/api/signup.js
import {createClient} from '@supabase/supabase-js';
import bcrypt from "bcrypt";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {name, lastName, pseudo, email, newPassword} = req.body;

        try {
// Vérifiez si le pseudo existe déjà
            const {data: user} = await supabase
                .from('connexion')
                .select('pseudo')
                .eq('pseudo', pseudo)
                .single();
            if (user) {
                res.status(409).json({error: "Ce pseudo existe déjà"});
            } else {
                bcrypt.hash(newPassword, 10, async function (err, hash) {
                    const {error} = await supabase
                        .from('connexion')
                        .insert({
                            name: name,
                            lastName: lastName,
                            pseudo: pseudo,
                            email: email,
                            mdp: hash,
                            isActive: false
                        });
                });
                res.status(200).json({message: "Compte créé avec succès"});
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

