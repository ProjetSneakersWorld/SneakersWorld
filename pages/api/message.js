// // pages/api/message.js
// import {createClient} from "@supabase/supabase-js";
// import {useEffect} from "react";
//
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
//
//
// export default async function message(req, res) {
//     if (req.method === 'POST') {
//
//
//         try {
//             // get all data in message table
//
//             const { data, error } = await supabase
//                 .from('message')
//                 .insert([
//                     { some_column: 'someValue', other_column: 'otherValue' },
//                 ])
//                 .select()
//
//             if (data) {
//                 console.log("réussi")
//                 res.status(200).json({message: data});
//             }else{
//                 res.status(404).json({error: "Une erreur s'est produite lors de la connexion à la base de données"});
//             }
//         } catch (error) {
//             // Gestion des erreurs lors de la connexion à la base de données
//             console.error(error);
//             res.status(500).json({error: "Une erreur s'est produite lors de la connexion à la base de données"});
//         }
//     } else {
//         // Gérer les autres méthodes HTTP
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }
