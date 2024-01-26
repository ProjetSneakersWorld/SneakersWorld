//
//
//
// // pages/api/info_user.js
// import {useEffect} from "react";
//
//
//
// export default async function info_user(req, res) {
//     if (req.method === 'POST') {
//
//
//         try {
//             // get all data in message table
//
//
//                 //
//                 // console.log("réussi")
//                 // res.status(200).json({message: data});
//                 //
//                 // res.status(404).json({error: "Une erreur s'est produite lors de la connexion à la base de données"});
//
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
