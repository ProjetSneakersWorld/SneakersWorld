import {useRouter} from "next/router";
import "../public/index.css"
import "../public/style.css"
import Head from "next/head";
import React from "react";


function Index() {
    const router = useRouter();

    const handleClick = (route) => {
        router.push(route);
    };

    return (
        <div>
            <Head>
                <title>Sneakers World</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <div className="body2">
                <div className="welcomDiv">
                    <h1 className="h1">Welcome to Sneakers World</h1>
                    <button className="button" onClick={() => handleClick('/login')}>Login</button>
                    <button className="button" onClick={() => handleClick('/signup')}>Signup</button>
                </div>
            </div>
            <div className="copyrightContainer">
                <p>&copy; Projet SAE 2024</p>
                <p>Mentions legales</p>
            </div>
        </div>

    // Conditions Générales d'Utilisation
    //
    // Bienvenue chez Sneaker World ! Notre plateforme vous offre la possibilité de vous connecter à une base de données. En utilisant nos services, vous acceptez les présentes Conditions Générales d'Utilisation.
    // Données personnelles : Nous ne collectons aucune donnée personnelle, hormis les informations requises pour la connexion et la gestion de votre compte. Nous ne vendons ni ne partageons ces informations avec des tiers.
    //     Base de données : Nous conservons les informations de connexion des utilisateurs dans une base de données exclusivement utilisée pour les besoins fonctionnels de Sneaker World.
    //     Politique de Confidentialité
    //
    // Chez Sneaker World, la protection de vos données personnelles est cruciale. Nous prenons des précautions pour protéger vos informations contre la perte, l'exploitation abusive et l'altération.
    //     Collecte de données : Nous recueillons les informations de connexion des utilisateurs pour fournir efficacement nos services. Aucune donnée personnelle supplémentaire n'est collectée au-delà de cet objectif.
    // Partage des données : Dans aucun cas nous ne partageons ni ne vendons les données utilisateur à des tiers, exception faite d'une injonction contraignante des autorités chargées de l'application de la loi.
    //     Accès aux données : Sur demande, les utilisateurs ont le droit d'accéder, de corriger ou de supprimer les données personnelles stockées.
    );
}

export default Index;
