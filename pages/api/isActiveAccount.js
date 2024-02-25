// pages/api/isActiveAccount.js
import {createClient} from '@supabase/supabase-js';
import { supabase } from './supabaseClient'
export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const pseudoCookies = req.body.pseudoCookies
            // console.log(pseudoCookies)
            let {data: id, error} = await supabase
                .from('connexion')
                .select('id, isActive') // Ajoutez isActive ici
                .eq('pseudo', pseudoCookies);

            if (error) {
                console.log("erreur : " + error)
            }
            // console.log(id[0].isActive);
            if (id[0].isActive===true) {
                return res.status(200).json({ valid: true });
            }
            else {
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
