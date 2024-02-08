// pages/api/
import CryptoJS from "crypto-js";

export default async function linkAccount(req, res) {
    if (req.method === 'POST') {
        const { pseudo } = req.body;

        try {
            const cipherPseudo = CryptoJS.AES.encrypt(pseudo, 'CléSecreTpour0Chiffrer1lePSeudo').toString();

            const link = `/active?token=${encodeURIComponent(cipherPseudo)}`;
            console.log(link);
            res.status(200).json({data: link});

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
