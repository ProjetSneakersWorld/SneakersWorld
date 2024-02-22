import { useRouter } from "next/router";
import { useState } from 'react';
import "../public/index.css"
import "../public/style.css"
import Head from "next/head";
import Modal from 'react-modal';

Modal.setAppElement('#__next');

function Index() {
    const router = useRouter();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [language, setLanguage] = useState('fr'); // Nouveau

    const handleClick = (route) => {
        router.push(route);
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    // Fonction pour changer la langue (nouveau)
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fr' : 'en');
    };

    // Contenu traduit en anglais (nouveau)
    const content = {
        fr: {
            privacyPolicy: "Politique de confidentialité",
            intro: "Bienvenue chez Sneaker World !",
            data: {
                usage:
                    "En utilisant nos services, vous acceptez les présentes Conditions Générales d'Utilisation.",
                personal:
                    "Données personnelles : Nous ne collectons aucune donnée personnelle, hormis les informations requises pour la connexion et la gestion de votre compte. Nous ne vendons ni ne partageons ces informations avec des tiers.",
                database:
                    "Base de données : Nous conservons les informations de connexion des utilisateurs dans une base de données exclusivement utilisée pour les besoins fonctionnels de Sneaker World.",
                security:
                    "Chez Sneaker World, la protection de vos données personnelles est cruciale. Nous prenons des précautions pour protéger vos informations contre la perte, l'exploitation abusive et l'altération.",
                collection:
                    "Collecte de données : Nous recueillons les informations de connexion des utilisateurs pour fournir efficacement nos services. Aucune donnée personnelle supplémentaire n'est collectée au-delà de cet objectif.",
                sharing:
                    "Partage des données : Dans aucun cas nous ne partageons ni ne vendons les données utilisateur à des tiers, excepté dans le cas d'une injonction contraignante des autorités chargées de l'application de la loi.",
                access:
                    "Accès aux données : Sur demande, les utilisateurs ont le droit d'accéder, de corriger ou de supprimer les données personnelles stockées.",
            },
        },
        en: {
            privacyPolicy: "Privacy Policy",
            intro: "Welcome to Sneaker World!",
            data: {
                usage:
                    "By using our services, you agree to these Terms of Service.",
                personal:
                    "Personal Data: We do not collect any personal data, except for the information required to log in and manage your account. We do not sell or share this information with third parties.",
                database:
                    "Database: We store user login information in a database used exclusively for the functional needs of Sneaker World.",
                security:
                    "At Sneaker World, the protection of your personal data is crucial. We take precautions to protect your information against loss, misuse and alteration.",
                collection:
                    "Data collection: We collect user login information to effectively provide our services. No additional personal data is collected beyond this purpose.",
                sharing:
                    "Data sharing: Under no circumstances do we share or sell user data to third parties, except in the case of a binding injunction from law enforcement authorities.",
                access:
                    "Data access: Upon request, users have the right to access, correct or delete stored personal data.",
            },
        }
    };

    return (
        <div>
            <Head>
                <title>Sneakers World</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="body2">
                <div className="welcomDiv">
                    <h1 className="h1">Welcome to Sneakers World</h1>
                    <button className="button" onClick={() => handleClick('/login')}>Login</button>
                    <button className="button" onClick={() => handleClick('/signup')}>Signup</button>
                </div>
            </div>
            <div className="copyrightContainer">
                <p>© Projet SAE 2024</p>
                <div>
                    <p onClick={openModal} style={{ cursor: "pointer" }}>{content[language].privacyPolicy}</p>
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel={content[language].privacyPolicy}
                className="modalPage"
            >
                <h2>{content[language].privacyPolicy}</h2>
                <div>
                    <p>{content[language].intro}</p>
                    <p>{content[language].data.usage}</p>
                    <p>{content[language].data.personal}</p>
                    <p>{content[language].data.database}</p>
                    <p>{content[language].data.security}</p>
                    <p>{content[language].data.collection}</p>
                    <p>{content[language].data.sharing}</p>
                    <p>{content[language].data.access}</p>
                </div>
                <button className="button" onClick={toggleLanguage} style={{marginTop: "15px"}}>{language === 'fr' ? 'English' : 'Français'}</button> {/* Nouveau */}
                <button className="button" style={{marginTop: "15px"}} onClick={closeModal}>Close</button>
            </Modal>
        </div>
    );
}

export default Index;