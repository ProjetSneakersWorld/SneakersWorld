// pages/api/checkPseudo.js
import {createClient} from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function checkPseudo(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        try {
            // Vérifiez si le pseudo existe déjà
            const { data: user } = await supabase
                .from('connexion')
                .select('email')
                .eq('email', email)
                .single();

            if (user) {
                res.status(409).json({error: "Cette email existe déjà"});
            } else {
                res.status(200).json({message: "Cette email est disponible"});
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
