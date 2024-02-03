import React, {useEffect, useRef, useState} from 'react';
import jwt from 'jsonwebtoken';
import '/public/Home.css';

const sendImage = "/images/send.png"
import {createClient} from "@supabase/supabase-js";
import Cookies from "js-cookie";
import moment from 'moment-timezone';
import {toast, ToastContainer} from "react-toastify";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import GameComponent from "../scenes/SceneShop"
import {useRouter} from "next/router";

const Home = () => {
    // const gameContainer = useRef(null);
    // const gameInstance = useRef(null);
    // const loadingMessage = useRef(null);
    const notify = (text) => toast(text);
    const router = useRouter();
    useEffect(() => {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        try {
            jwt.verify(token, 'secret_key');
        } catch (err) {
            // Redirigez vers la page d'accueil si le token n'est pas valide
            router.push('/');
        }
    }, []);
    // const isSSR = typeof window === 'undefined';
    // useEffect(() => {
    //     if (!isSSR) {
    //         const loadGame = async () => {
    //             const Phaser = await import('phaser');
    //             const SceneMain = require('../scenes/SceneMain').default;
    //             const config = {
    //                 type: Phaser.AUTO,
    //                 parent: gameContainer.current,
    //                 width: "75%", // Utilisez la largeur de la fenêtre
    //                 height: "84%", // Utilisez la hauteur de la fenêtre
    //                 scene: [SceneMain], // Utilisez un tableau pour la scène
    //                 audio: {
    //                     disableWebAudio: true,
    //                 },
    //                 physics: {
    //                     default: 'arcade',
    //                     arcade: {
    //                         fps: 60,
    //                         gravity: {y: 0},
    //                     }
    //                 },
    //             };
    //
    //             gameInstance.current = new Phaser.Game(config);
    //             gameContainer.current.style.borderRadius = '15px';
    //             gameContainer.current.style.overflow = 'hidden';
    //             gameContainer.current.addEventListener('click', () => {
    //                 gameInstance.current.input.keyboard.enabled = true;
    //             });
    //             gameInstance.current.scene.scenes.forEach(scene => {
    //                 scene.events.on('create', () => {
    //                     // Ajustez ces valeurs en fonction de la taille de votre carte
    //                     const mapWidth = 2208;
    //                     const mapHeight = 1408;
    //
    //                     scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight, true);
    //                     scene.cameras.main.setZoom(Math.min(gameInstance.current.scale.width / mapWidth, gameInstance.current.scale.height / mapHeight));
    //                     scene.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
    //
    //                     // Masquer le message de chargement une fois que la carte est chargée
    //                     loadingMessage.current.style.display = 'none';
    //                 });
    //             });
    //
    //             return () => {
    //                 // Destroy the game instance when the component is unmounted
    //                 gameInstance.current.destroy(true);
    //             };
    //         }
    //         loadGame();
    //     }
    // }, []);


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //CODE Chat et gestion de le BD supabase
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let lastAuthor = null;
    let pseudoCookies = Cookies.get('Pseudo')
    const [id_USER, setId_USER] = useState('null');
    const [isActive, setIsActive] = useState('null');
    const [isLoading, setIsLoading] = useState(true);
    const [isSendMessage, setIsSendMessage] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [isLoadAvatar, setIsLoadAvatar] = useState(true);

    useEffect(() => {
        //choper le cookies pseudo
        document.getElementById("PseudoName").innerText = "Welcome, " + pseudoCookies;
        let messageContainer = document.getElementById('messageContainer');

        const fetchMessagesAndUsers = async () => {
            // Récupérer tous les messages
            let currentDate = new Date();
            let pastDate = new Date();

            // Set the pastDate to 24 hours ago
            pastDate.setHours(currentDate.getHours() - 24);

            let {data: messages, error2} = await supabase
                .from('message')
                .select('*')
                .eq('place', "home")
                .gte('timestamp', pastDate.toISOString().slice(0, 19).replace('T', ' '));

            if (error2) {
                console.error('Erreur lors de la récupération des messages:', error);
                return;
            }
            // Si aucun message n'est disponible, afficher un message
            if (messages.length === 0) {
                // Afficher un message si aucun message n'est disponible
                messageContainer.className = "messageVide";
                const messageVideP = document.createElement("p");
                messageVideP.id = "messageVideP";
                messageVideP.style.textAlign = "center";
                messageVideP.style.userSelect = "none";
                messageVideP.innerText = "Aucun message disponible";
                messageContainer.appendChild(messageVideP);
                setIsLoading(false);
                return;
            }

            // Récupérer tous les utilisateurs
            let {data: users, error} = await supabase
                .from('connexion')
                .select('*');
            if (error) {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
                return;
            }

            // Créer un objet pour faciliter la recherche des pseudos
            const usersById = users.reduce((acc, user) => ({
                ...acc, [user.id]: user.pseudo
            }), {});

            // Trier les messages par timestamp
            messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // Afficher tous les messages
            for (let message of messages) {
                const pseudo = usersById[message.id_user];
                const date = new Date(message.timestamp);
                // console.log(date.getHours() + "h" + date.getMinutes());
                if (pseudo) {
                    displayMessage(pseudo, date.getHours() + "h" + date.getMinutes(), message);
                }
            }
        };

        fetchMessagesAndUsers();
        let dateOnlineByPseudo = "";
        const fetchPseudoAndDateOnline = async () => {
            // Récupère la date actuelle de dateOnline pour tous les utilisateurs
            let {data: users, error} = await supabase
                .from('connexion')
                .select('pseudo, dateOnline');

            // Crée un objet pour stocker les datesOnline par pseudo
            dateOnlineByPseudo = {};
            users.forEach(user => {
                dateOnlineByPseudo[user.pseudo] = user.dateOnline;
            });
        }

        fetchPseudoAndDateOnline();
        // Créer un canal pour écouter les changements
        supabase.channel('custom-all-channel')
            //a chaque insertion dans la table message
            .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'message'}, async (payload) => {
                const pseudo = await pseudoMessage(payload.new.id_user);
                const date = new Date();
                displayMessage(pseudo, date.getHours() + "h" + date.getMinutes(), payload.new);
                setIsLoading(false);
            })
            // A chaque mise à jour dans la table connexion
            .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'connexion'}, async (payload) => {
                // Récupère l'ancienne dateOnline pour le pseudo qui a été modifié
                let oldDateOnline = dateOnlineByPseudo[payload.new.pseudo];
                if (dateOnlineByPseudo !== "") {
                    // Compare l'ancienne dateOnline avec la nouvelle
                    if (payload.new.dateOnline !== oldDateOnline && payload.new.pseudo !== pseudoCookies) {
                        // console.log('Change received!', payload);
                        notify(payload.new.pseudo + " vient de se connecter");
                        // Met à jour la dateOnline dans l'objet dateOnlineByPseudo
                        dateOnlineByPseudo[payload.new.pseudo] = payload.new.dateOnline;
                    }
                }
            })
            // A chaque mise à jour dans la table connexion
            .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'connexion'}, async (payload) => {
                if(payload.new.isActive === true){
                    setIsActive(true);
                }
            })
            .subscribe();


        // Fonction pour afficher un message
        const displayMessage = (pseudo, dateMessage, message) => {
            // Si l'auteur du message est différent du dernier auteur
            if (pseudo !== lastAuthor) {
                // Créer une nouvelle div pour l'auteur du message
                const newAuthorDiv = document.createElement("div");
                newAuthorDiv.className = "messageAuthor";

                // Créer un nouveau paragraphe pour l'auteur du message
                const newAuthorP = document.createElement("p");
                newAuthorP.style.color = "white";
                newAuthorP.id = "messageAuthor";
                const newAuthorContent = document.createTextNode(pseudo + " " + dateMessage);
                newAuthorP.appendChild(newAuthorContent);

                // Ajouter le paragraphe à la div de l'auteur du message
                newAuthorDiv.appendChild(newAuthorP);

                // Ajouter la nouvelle div à l'élément messageContainer
                messageContainer.appendChild(newAuthorDiv);

                // Mettre à jour l'auteur du dernier message
                lastAuthor = pseudo;
            }

            // Créer une nouvelle div pour le message
            const newMessageDiv = document.createElement("div");
            newMessageDiv.style.background = "rgb(103, 194, 98)";
            newMessageDiv.style.color = "white";

            // Si le message vient de l'utilisateur actuel, changer la couleur de fond
            if (pseudo === pseudoCookies) {
                newMessageDiv.style.background = "rgb(50, 121, 249)";
            }

            newMessageDiv.className = "messageContainer";
            // Créer un nouveau paragraphe pour le message
            const newMessageP = document.createElement("p");
            newMessageP.id = "message";
            const newMessageContent = document.createTextNode(message.message);
            newMessageP.appendChild(newMessageContent);

            // Ajouter le paragraphe à la div du message
            newMessageDiv.appendChild(newMessageP);

            // Ajouter la nouvelle div à l'élément messageContainer
            messageContainer.appendChild(newMessageDiv);
            if (message.length !== 0) {
                // Après avoir ajouté un nouveau message au conteneur
                let chatContainer = document.querySelector('.chatContainer2');
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            setIsLoading(false);
        };

    }, []);

    useEffect(() => {
        // Récupérer l'id du pseudo
        const fetchId_Pseudo = async () => {
            // console.log(pseudoCookies)
            try {
                let {data: id, error} = await supabase
                    .from('connexion')
                    .select('id, isActive') // Ajoutez isActive ici
                    .eq('pseudo', pseudoCookies);

                if (error) throw error; // Si une erreur est renvoyée par supabase, la propager

                setId_USER(id[0].id);
                setIsActive(id[0].isActive);
                if (isActive) {
                }
            } catch (error) {
                console.error('Une erreur est survenue lors de la récupération de l\'ID :', error);
                // Gérer l'erreur comme vous le souhaitez
            }
        }

        fetchId_Pseudo();


        // // Fonction pour télécharger une image
        // async function uploadImage() {
        //     // Utilisez fetch pour obtenir le contenu de l'image
        //     const response = await fetch("/images/sneakers.png");
        //     const imageBlob = await response.blob();
        //
        //     const {data, error} = await supabase
        //         .storage
        //         .from('SneakersWorld')
        //         .upload('avatar1.png', imageBlob, {
        //             cacheControl: '3600', upsert: true,
        //         })
        //
        //     if (error) {
        //         console.error('Erreur lors de l\'upload de l\'image : ', error)
        //         setIsLoadAvatar(false);
        //     } else {
        //         setIsLoadAvatar(false);
        //         console.log('Image uploadée avec succès : ', data)
        //     }
        // }
        //
        // uploadImage();


        // // Obtenez l'URL publique de l'image
        // async function fetchImage() {
        //
        //     const publicUrl = supabase.storage.from('SneakersWorld').getPublicUrl('avatar1.png')
        //
        //     console.log(publicUrl)
        // }


        async function fetchImage() {
            const img = new Image();
            img.src = `https://ysrnyjbfemojpnptzrrz.supabase.co/storage/v1/object/public/SneakersWorld/${pseudoCookies}_avatar.png?${new Date().getTime()}`;
            img.onload = () => {
                setIsLoadAvatar(false);
                setAvatarSrc(img.src);
            };
        }

        fetchImage();
    }, []);


    const sendMessage = async () => {
        let msg = document.getElementById('inputMessage').value;
        document.getElementById('messageContainer').className = "";
        if (document.getElementById('messageVideP')) {
            document.getElementById('messageVideP').remove();
        }
        if (id_USER === null || id_USER === undefined) {
            console.log("erreur lors de la recuperation de l'id du pseudo !!")
        } else {
            if (msg === "") {
                document.getElementById("erreurSend").innerText = "Message vide !";
            } else {
                setIsSendMessage(true);
                setIsLoading(true);
                try {
                    await supabase
                        .from('message')
                        .insert([{
                            id_user: id_USER,
                            message: msg,
                            timestamp: moment().tz('Europe/Paris').format(),
                            place: 'home'
                        },])
                        .select()
                } catch (error) {
                    console.error("Une erreur s'est produite lors de la récupération des données :", error);
                }
            }
        }
    }


    const pseudoMessage = async (id_user_message) => {
        //choper le pseudo de l'utilisateur qui a send un msg

        // Récupérer tous les messages
        let {data: messages, error} = await supabase
            .from('message')
            .select('*');
        // console.log(messages)
        if (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            return;
        }
        // Pour chaque message, récupérer le pseudo de l'utilisateur correspondant
        for (let message of messages) {
            let {data: user, error} = await supabase
                .from('connexion')
                .select('pseudo')
                .eq('id', id_user_message);

            if (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', error);
                continue;
            }

            // console.log(user)
            if (user[0] !== undefined) {

                return user[0].pseudo
            }
        }
    }

    const Rolling = (w, h) => (<svg
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
            stroke="#000000"
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


    return (<div>
        <Head>
            <title>Map principal</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <div style={{background: "black", height: "100Vh"}}>
                <div className="divPixi">
                    <div className="pixiContainerTitle">
                        <p className="titre">Sneakers World</p>
                        <p id="PseudoName" className="pseudo"></p>
                    </div>
                    <div style={{display: "flex", alignItems: "center"}}>
                    <div style={{marginLeft: "auto", paddingRight: "15px", display: "flex", alignItems: "center"}}>
                        <div style={{
                            marginLeft: "auto", paddingRight: "15px", display: "flex", alignItems: "center"
                        }}
                             onClick={() => router.push('/logout')}>
                            <button className="buttonLogout">Logout</button>
                        </div>
                        <div className="buttonProfil">
                            {isLoadAvatar ? Rolling(50, 50) : <img src={avatarSrc} width="50" height="50" alt=""/>}
                        </div>
                    </div>
                    </div>
                </div>

                <div className="pixiContainer">
                    <div className="chatContainer">
                        <div style={{display: "flex", justifyContent: "center", flexDirection: "column"}}>
                            <div style={{display: "flex", justifyContent: "center", fontFamily: "Arial"}}>
                                <p style={{fontSize: "20px"}}>Chat Principal</p>
                            </div>
                            {isLoading ? (<div>
                                {Rolling(60, 60)}
                                <p id="textMessage" style={{
                                    margin: "0",
                                    display: "flex",
                                    justifyContent: "center",
                                    fontFamily: "Arial,ui-serif",
                                    fontSize: "18px"
                                }}>{isSendMessage ? "Envoie ..." : "Chargement ..."}</p>
                            </div>) : (<div className="chatContainer3">
                                <form style={{display: "flex", alignItems: "center"}} onSubmit={(e) => {
                                    e.preventDefault(); // Empêche le rechargement de la page
                                    sendMessage();
                                }}>
                                    <input className="inputsChat" maxLength="75" id="inputMessage"
                                           placeholder="envoyer un message" required/>
                                    <button type="submit" style={{background: "none", border: "none"}}>
                                        <img
                                            width="35"
                                            height="35"
                                            style={{display: "flex", alignItems: "center", cursor: "pointer"}}
                                            src={sendImage}
                                            alt="external-send-user-interface-febrian-hidayat-gradient-febrian-hidayat"
                                        />
                                    </button>
                                </form>
                            </div>)}
                            <div className="chatContainer2" style={{height: isLoading ? "0" : "72VH"}}>
                                <div className="messageAuthor">
                                    <p id="messageAuthor" style={{margin: 0}}></p>
                                </div>
                                <div id="messageContainer"
                                     style={{paddingBottom: "3rem", width: "-webkit-fill-available"}}>

                                </div>
                            </div>
                            <div className="chatContainer4">
                                <p id="erreurSend"></p>
                            </div>
                        </div>
                    </div>
                    {/*<div ref={pixiContainer} className="phaser"></div>*/}
                    <div style={{display: "flex", alignItems: "center"}}
                         onClick={() => document.getElementById("inputMessage").blur()}>
                        {/*<div ref={gameContainer}/>*/}
                        <GameComponent />
                    </div>
                    <div>
                        <ToastContainer/>
                    </div>
                    {isActive === false ? (
                        <div className="modal">
                            <div className="modal-content2">
                                <div style={{flexDirection: "column", alignItems: "center",display: "flex", fontSize: "19px", color: "white"}}>
                                    <p>Votre compte n'est pas activer</p>
                                    <p>Allez dans vos mail activer le liens pour activer votre compte</p>
                                    <button>Renvoyer un lien</button>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                </div>
        </div>
        )
    </div>);
};

export default Home;

