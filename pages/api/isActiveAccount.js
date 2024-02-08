// pages/api/isActiveAccount.js
import {createClient} from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const pseudoCookies = req.body.pseudoCookies
            let {data: id, error} = await supabase
                .from('connexion')
                .select('id, isActive') // Ajoutez isActive ici
                .eq('pseudo', 'admin');

            if (error) {
                console.log("erreur : " + error)
            }
            // console.log(id[0].isActive);
            if (id[0].isActive===true) {
                return res.status(200).json({ valid: true });
            }
            else {
                console.log(false)
                return res.status(401).json({ message: "Account is not active." });
            }

        } catch (error) {
            console.log("Error during active account verification");
            return res.status(404).json({ message: "Error contacting BD" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
