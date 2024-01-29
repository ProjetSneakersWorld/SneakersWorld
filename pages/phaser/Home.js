import React, {useEffect, useRef, useState} from 'react';
import jwt from 'jsonwebtoken';
import '/public/pixi.css';
import {router} from "next/router";
const sendImage = "/images/send.png"
import {createClient} from "@supabase/supabase-js";
import Cookies from "js-cookie";
import moment from 'moment-timezone';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Home = () => {
    const gameContainer = useRef(null);

    useEffect(() => {
        const Phaser = require('phaser');
        const SceneMain = require('../scenes/SceneMain').default;
        const config = {
            type: Phaser.AUTO,
            parent: gameContainer.current,
            width: window.innerWidth - 700, // Utilisez la largeur de la fenêtre
            height: window.innerHeight - 110, // Utilisez la hauteur de la fenêtre
            scene: [SceneMain], // Utilisez un tableau pour la scène
            physics: {
                default: 'arcade',
                arcade: {
                }
            }
        };

        const game = new Phaser.Game(config);

        game.scene.scenes.forEach(scene => {
            scene.events.on('create', () => {
                // Ajustez ces valeurs en fonction de la taille de votre carte
                const mapWidth = 2208;
                const mapHeight = 1408;

                scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight, true);
                scene.cameras.main.setZoom(Math.min(game.scale.width / mapWidth, game.scale.height / mapHeight));
                scene.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
            });
        });

        return () => {
            // Destroy the game instance when the component is unmounted
            game.destroy(true);
        };
    }, []);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //CODE Chat et gestion de le BD supabase
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let lastAuthor = null;
    let pseudoCookies = Cookies.get('Pseudo')
    const [id_USER, setId_USER] = useState('null');
    const [isLoading, setIsLoading] = useState(true);

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


        // Créer un canal pour écouter les changements dans la table "message"
        supabase.channel('custom-all-channel')
            .on(
                'postgres_changes',
                {event: 'INSERT', schema: 'public', table: 'message'},
                async (payload) => {
                    const pseudo = await pseudoMessage(payload.new.id_user);
                    const date = new Date();
                    displayMessage(pseudo, date.getHours() + "h" + date.getMinutes(), payload.new);
                    setIsLoading(false);
                }
            )
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
                newAuthorP.style.color= "white";
                newAuthorP.id = "messageAuthor";
                const newAuthorContent = document.createTextNode(pseudo + " "+dateMessage);
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
            newMessageDiv.style.color= "white";

            // Si le message vient de l'utilisateur actuel, changer la couleur de fond
            if (pseudo === pseudoCookies) {
                newMessageDiv.style.background= "rgb(50, 121, 249)";
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
            // Après avoir ajouté un nouveau message au conteneur
            let chatContainer = document.querySelector('.chatContainer2');
            chatContainer.scrollTop = chatContainer.scrollHeight;

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
                    .select('id')
                    .eq('pseudo', pseudoCookies);

                if (error) throw error; // Si une erreur est renvoyée par supabase, la propager

                setId_USER(id[0].id);
            } catch (error) {
                console.error('Une erreur est survenue lors de la récupération de l\'ID :', error);
                // Gérer l'erreur comme vous le souhaitez
            }
        }

        fetchId_Pseudo();
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
                document.getElementById("erreurSend").innerText = "Message vide !"
            } else {
                setIsLoading(true);
                try {
                    const {data, error} = await supabase
                        .from('message')
                        .insert([
                            {id_user: id_USER, message: msg, timestamp: moment().tz('Europe/Paris').format(), place: 'home'},
                        ])
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

    const Rolling = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{
                margin: "auto",
                display: "block",
                shapeRendering: "auto",
            }}
            width="60px"
            height="60px"
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
                    animation: "rotate 1s infinite",
                    transformOrigin: "50% 50%",
                    strokeLinecap: "round",
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
        </svg>
    );


    return (
        <div style={{background: "black"}}>
            <div className="divPixi">
                <div className="pixiContainerTitle">
                    <p className="titre">Sneakers World</p>
                    <p id="PseudoName" className="pseudo"></p>
                </div>
                <div style={{display: "flex", alignItems: "center"}}>
                    <div style={{marginLeft: "auto", paddingRight: "15px"}} onClick={() => router.push('/logout')}>
                        <button className="buttonLogout">Logout</button>
                    </div>
                </div>
            </div>

            <div className="pixiContainer">
                <div className="chatContainer">
                    <div style={{display: "flex", justifyContent: "center", flexDirection: "column"}}>
                        <div style={{display: "flex", justifyContent: "center", fontFamily: "Arial"}}>
                            <p style={{fontSize: "20px"}}>Chat Principal</p>
                        </div>
                        {isLoading ? (
                            <div>
                                <Rolling/>
                                <p style={{
                                    margin: "0",
                                    display: "flex",
                                    justifyContent: "center",
                                    fontFamily: "Arial,ui-serif",
                                    fontSize: "18px"
                                }}>Chargement ...</p>
                            </div>
                        ) : (
                            <div className="chatContainer3">
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
                            </div>
                        )}
                    </div>
                    <div className="chatContainer2" style={{height: isLoading ? "0" : "72VH"}}>
                        <div className="messageAuthor">
                            <p id="messageAuthor" style={{margin: 0}}></p>
                        </div>
                        <div id="messageContainer" style={{paddingBottom: "3rem", width: "-webkit-fill-available"}}>

                        </div>
                    </div>
                    <div className="chatContainer4">
                        <p id="erreurSend"></p>
                    </div>
                </div>
                {/*<div ref={pixiContainer} className="phaser"></div>*/}
                <div>
                    <div ref={gameContainer}/>
                </div>
            </div>
        </div>
    );
};

export async function getServerSideProps(context) {
    const {req} = context;
    const token = req.cookies.TOKEN;
    if (!token) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    } else {
        try {
            jwt.verify(token, 'secret_key');
        } catch (err) {
            // console.error('Error verifying token:', err);
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
    }

    return {
        props: {},
    };
}

export default Home;

