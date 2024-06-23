import React, {useContext, useEffect, useState} from 'react';
import '/public/Home.css';
import Cookies from "js-cookie";
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import GameComponent from "../../src/scenes/Scene"
import {useRouter} from "next/router";
import Chat from "../componentHome/chat"
import {GameContext} from '../../src/GameContext';
import ManageAdmin from "../manageAdmin";
import ManageAccount from "../manageAccount";
import moment from "moment-timezone";
import {supabase} from '../api/supabaseClient'

const Home = () => {
    const [isToken, setIsToken] = useState(false);
    const router = useRouter();
    const {currentScene, setCurrentScene} = useContext(GameContext);
    const [isOpen, setIsOpen] = useState(false);
    // console.log(currentScene);
    // if (currentScene === "Scene") {
    //     console.log("Scene")
    // }

    useEffect(() => {
        isAuth().catch((error) => {
            console.error(error);
            router.push("/login");
        });
    }, []);

    async function isAuth() {
        const token = document.cookie.replace(/(?:^|.*;\s*)TOKEN\s*=\s*([^;]*).*$|^.*$/, "$1");
        const response = await fetch("/api/checkToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({token}),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to authenticate.");
        }

        setIsToken(data.valid);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //CODE Chat et gestion de le BD supabase
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let pseudoCookies = Cookies.get('Pseudo')
    const [isActive, setIsActive] = useState("null");
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [isLoadAvatar, setIsLoadAvatar] = useState(true);

    useEffect(() => {
        if (isToken) {
            // Récupérer l'id du pseudo
            const fetchId_Pseudo = async () => {
                // console.log(pseudoCookies)
                const response = await fetch("/api/isActiveAccount", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({pseudoCookies}),
                });

                if (response.status === 200) {
                    setIsActive(true);
                } else if (response.status === 401) {
                    console.log("pas actif")
                    setIsActive(false);
                } else {
                    console.error('Une erreur est survenue lors de la récupération de l\'ID')
                }
            }

            async function fetchImage() {
                const img = new Image();
                img.src = `https://ysrnyjbfemojpnptzrrz.supabase.co/storage/v1/object/public/SneakersWorld/${pseudoCookies}_avatar.png?${new Date().getTime()}`;
                img.onload = () => {
                    setAvatarSrc(img.src);
                    setIsLoadAvatar(false);
                };
                img.onerror = () => {
                    setAvatarSrc('/images/avatar.svg');
                    setIsLoadAvatar(false);
                };
            }


            fetchId_Pseudo();
            fetchImage();
        }
    }, [isToken]);

    useEffect(() => {
        if (isActive === true && isActive !== "null") {
            document.getElementById("PseudoName").innerText = "Welcome, " + pseudoCookies;
        }
    }, [isActive]);

    // setInterval(() => {
    //     console.log('Bonjour');
    // }, 5000);

    const Rolling = (w, h, color) => (<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{
            margin: "auto", display: "block", shapeRendering: "auto",
        }}
        width={w}
        height={h}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
    >
        <circle
            cx="50"
            cy="50"
            fill="none"
            stroke={color}
            strokeWidth="6"
            r="28"
            strokeDasharray="110 40"
            style={{
                animation: "rotate 1s infinite", transformOrigin: "50% 50%", strokeLinecap: "round",
            }}
        />
        <style>
            {`
                @keyframes rotate {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                    }
                  `}
        </style>
    </svg>);

    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [isManageAdminOpen, setIsManageAdminOpen] = useState(false);
    const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);

    const handleManageAdminOpen = () => {
        setIsManageAdminOpen(true);
    };

    const handleManageAdminClose = () => {
        setIsManageAdminOpen(false);
    };

    const handleManageAccountOpen = () => {
        setIsManageAccountOpen(true);
    };

    const handleManageAccountClose = () => {
        setIsManageAccountOpen(false);
    };

    const updateDateOnline = async () => {
        try {
            const {error} = await supabase
                .from("connexion")
                .update({
                    isOnline: moment().tz("Europe/Paris").format(),
                })
                .eq("pseudo", pseudoCookies);

            if (error) {
                console.error("Une erreur s'est produite : ", error);
            } else {
                // console.log("Mise à jour réussie de la dateOnline");
            }
        } catch (error) {
            console.error("Une erreur s'est produite : ", error);
        }
    };
    //Appelle la fonction de mise à jour toutes les 5 secondes
    setInterval(updateDateOnline, 5000);

    if (isToken === false || isActive === "null") {
        return (
            <div>
                <p className="ChargementText">Loading ...</p>
                {Rolling(80, 80, "#ffffff")}
            </div>);
    } else if (isActive === false) {
        return (
            <div className="modal">
                <div className="modal-content2">
                    <div style={{
                        flexDirection: "column",
                        alignItems: "center",
                        display: "flex",
                        fontSize: "19px",
                        color: "white"
                    }}>
                        <p>Votre compte n'est pas activer !</p>
                        <p>Des indications vous on était envoyé sur votre mail</p>
                        {/*<button>Renvoyer un lien</button>*/}
                        <button className="buttonModal" style={{marginTop: "5px", marginBottom: "15px"}}
                                onClick={() => window.location.reload()}>Recharger la page
                        </button>

                        <button className="buttonModal" onClick={() => router.push('/logout')}>Deconnexion
                        </button>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div id="pagePrincipale">
                <Head>
                    <title>Map principal</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
                </Head>
                <div style={{background: "black", height: "100Vh"}}>
                    <div className="divPrincipal">
                        <div className="containerTitle">
                            <p className="titre">{currentScene === 'home' ? 'Sneakers World' : currentScene === 'SceneShop' ? 'Shop' : Rolling(50, 50, "#ffffff")}</p>
                            <p id="PseudoName" className="pseudo"></p>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div style={{
                                marginLeft: "auto",
                                paddingRight: "15px",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <div className="buttonProfil" onMouseEnter={() => setIsOpenDropdown(true)}
                                     onMouseLeave={() => setIsOpenDropdown(false)}>
                                    {isLoadAvatar ? Rolling(50, 50, "#000000") :
                                        <img src={avatarSrc} width="50" height="50" alt=""/>}
                                    {isOpenDropdown && (
                                        <div className="dropdownMenu">
                                            <a className="item" onClick={() => setCurrentScene('home')}>Home</a>
                                            {pseudoCookies === "admin" ? (
                                                <a className="item" onClick={handleManageAdminOpen}>Manage Admin</a>
                                            ) : (
                                                <a className="item" onClick={handleManageAccountOpen}>Manage Account</a>
                                            )}
                                            <a className="item" href="/logout">Logout</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isManageAdminOpen && <ManageAdmin onClose={handleManageAdminClose}/>}
                        {isManageAccountOpen && <ManageAccount onClose={handleManageAccountClose}/>}
                    </div>
                    <div className="ContainerPrincipale" id="ContainerPrincipale">
                        {currentScene === 'home' ?
                            <Chat place="home" nameChat="Chat Principal"/> : currentScene === 'SceneShop' ?
                                <Chat place="shop" nameChat="Shop"/> : Rolling(50, 50, "#ffffff")}

                        <div style={{display: "flex", alignItems: "center"}} onClick={() => {
                            if (document.getElementById("inputMessage")) {
                                document.getElementById("inputMessage").blur()
                            }
                        }}>
                            <div style={{display: "flex"}}>
                                <GameComponent/>
                            </div>
                        </div>
                        {/*<Online/>*/}
                    </div>
                    <div className="help" onClick={() => setIsOpen(true)}>
                        <img src="/images/aide.png" width="75" height="75" style={{scale: "1.1"}} alt=""/>
                    </div>
                    {isOpen && (
                        <div className="modal-help-overlay">
                            <div className="modal-help-content"> {/* Changement ici */}
                                <div className="modal-help-header">
                                    <h2 className="modal-help-title">Bienvenue sur Sneakers World</h2>
                                    <button className="close-help-button" onClick={() => setIsOpen(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-help-body">
                                    <p>
                                        Sneakers World est un espace dédié aux passionnés de sneakers. Rejoignez notre
                                        communauté pour partager votre
                                        passion dans un environnement convivial.
                                    </p>
                                    <Section title="Navigation et Interaction">
                                        <li>Utilisez les touches fléchées de votre clavier (haut, bas, droite, gauche) pour vous déplacer.</li>
                                        <li>Réduisez la map avec la souris. Cliquez et faites glisser pour la déplacer.</li>
                                        <li>Changez de pièce en entrant dans une maison indiquant une pièce spécifique.</li>
                                    </Section>
                                    <Section title="Fonctionnalités de Chat">
                                        <li>Discutez en temps réel avec les utilisateurs connectés.</li>
                                        <li>Ajoutez des réactions aux messages parmi celles disponibles.</li>
                                        <li>Recevez une notification lors de la connexion d'un nouveau joueur.</li>
                                        <li>Visualisez les joueurs présents dans la même pièce sur la map.</li>
                                    </Section>
                                    <Section title="Personnalisation et Gestion de Compte">
                                        <li>Personnalisez l'apparence de votre personnage avec le bouton en bas de la map.</li>
                                        <li>Depuis votre avatar, changez votre email ou supprimez votre compte.</li>
                                    </Section>
                                    <p className="modal-footer-text">
                                        Explorez, discutez et partagez votre passion pour les sneakers dans cet espace unique !
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )
                <div className="modal" id="modalHelp" style={{display: "none"}}>
                    <div className="modal-content2">
                        <div className="modal-content2-bis">
                            <p>Aide</p>
                            <p>blablabla</p>
                            <div style={{display: "flex"}}>
                                <img src="/images/up.png" width="75" height="75" alt=""/>
                                <img src="/images/up.png" width="75" height="75" alt="" style={{rotate: '180deg'}}/>
                                <img src="/images/up.png" width="75" height="75" alt="" style={{rotate: '90deg'}}/>
                                <img src="/images/up.png" width="75" height="75" alt="" style={{rotate: '270deg'}}/>
                            </div>
                        </div>
                        <div className="modal-content-close">
                            <button className="buttonChat"
                                    onClick={() => document.getElementById('modalHelp').style.display = "none"}>
                                X
                            </button>
                        </div>
                    </div>
                </div>
            </div>);
    }
};

const Section = ({ title, children }) => (
    <div className="section-help">
        <h3 className="section-help-title">{title}</h3>
        <ul className="section-help-list">{children}</ul>
    </div>
);

export default Home;

