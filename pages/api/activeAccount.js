// pages/api/activeAccount.js
import { supabase } from './supabaseClient'
export default async function activeAccountSupabase(req, res) {
    if (req.method === 'POST') {
        const { pseudo } = req.body;

        try {
            const { data, error } = await supabase
                .from('connexion')
                .update({isActive: "TRUE"})
                .eq('pseudo', pseudo)
                .select()

            if (data) {
                // console.log("Réussi");
                res.status(200).json({message: "Compte activer"});
            } else {
                // console.log("Échec");
                res.status(500).json({error: "Une erreur s'est produite lors de l'activation du compte !"});
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
