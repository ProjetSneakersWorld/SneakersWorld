// pages/api/activeAccount.js
import {createClient} from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
import CryptoJS from "crypto-js";

export default async function activeAccount(req, res) {
    if (req.method === 'POST') {
        const { pseudo } = req.body;

        try {
            const pseudo = 'monPseudo';
            const cipherPseudo = CryptoJS.AES.encrypt(pseudo, 'secret key 123').toString();

            const link = `/activeaccount?pseudo=${encodeURIComponent(cipherPseudo)}`;
            console.log(link);

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
