import React, {useEffect, useRef, useState} from 'react';
import jwt from 'jsonwebtoken';
import * as PIXI from "pixi.js"
import {Tilemap} from '@pixi/tilemap';
import {Assets} from '@pixi/assets';
import '/public/pixi.css';
import {router} from "next/router";
const sendImage = "/images/send.png"
import {createClient} from "@supabase/supabase-js";
import Cookies from "js-cookie";
import moment from 'moment-timezone';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


const PixiComponent = () => {
    const pixiContainer = useRef(null);
    const windowSize = useRef([0, 0]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            windowSize.current = [window.innerWidth, window.innerHeight];
        }

        // Set up Pixi.js
        let renderer = PIXI.autoDetectRenderer({
            width: windowSize.current[0] - 380,
            height: windowSize.current[1] - 110
        });

        // Add the renderer view element to the DOM
        pixiContainer.current.innerHTML = ""; // Clear the container
        pixiContainer.current.appendChild(renderer.view);

        // Create the stage
        const stage = new PIXI.Container();

        Assets.load('/map.json').then((resources) => {
            // Check if 'data' property exists
            if (resources && resources.data) {
                const data = resources.data;

                // Assuming your Tiled map uses a single tileset image
                const tileset = PIXI.Texture.from('/map_principal.png');
                const tilemap = new Tilemap([tileset.baseTexture]);
                stage.addChild(tilemap);

                // Loop through each layer in the Tiled map
                for (let layer of data.layers) {
                    // Loop through each tile in the layer
                    for (let y = 0; y < data.height; y++) {
                        for (let x = 0; x < data.width; x++) {
                            const i = x + y * data.width;
                            const id = layer.data[i] - 1; // Tiled IDs are one-indexed
                            if (id >= 0) {
                                // Calculate the tileset position of the tile
                                const tx = id % (tileset.width / data.tilewidth);
                                const ty = Math.floor(id / (tileset.width / data.tilewidth));
                                const texture = new PIXI.Texture(tileset, new PIXI.Rectangle(tx * data.tilewidth, ty * data.tileheight, data.tilewidth, data.tileheight));

                                // Create a sprite and add it to the tilemap layer
                                const sprite = new PIXI.Sprite(texture);
                                sprite.position.set(x * data.tilewidth, y * data.tileheight);
                                tilemap.addChild(sprite);
                            }
                        }
                    }
                }

                // Render the stage
                renderer.render(stage);
            } else {
                console.error("Failed to load Tiled map. Check the path and format of the file.");
            }
        });

    }, []);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //CODE Chat et gestion de le BD supabase
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let lastAuthor = null;
    const [id_USER, setId_USER] = useState('null');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        //choper le cookies pseudo
        document.getElementById("PseudoName").innerText = "Welcome, " + Cookies.get('Pseudo');
        let messageContainer = document.getElementById('messageContainer');

        const fetchMessagesAndUsers = async () => {
            // Récupérer tous les messages
            let {data: messages, error2} = await supabase
                .from('message')
                .select('*');

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
            const usersById = users.reduce((acc, user) => ({...acc, [user.id]: user.pseudo}), {});

            // Afficher tous les messages
            for (let message of messages) {
                const pseudo = usersById[message.id_user];
                if (pseudo) {
                    displayMessage(pseudo, message);
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
                    displayMessage(pseudo, payload.new);
                    setIsLoading(false);
                }
            )
            .subscribe();

        // Fonction pour afficher un message
        const displayMessage = (pseudo, message) => {
            // Si l'auteur du message est différent du dernier auteur
            if (pseudo !== lastAuthor) {
                // Créer une nouvelle div pour l'auteur du message
                const newAuthorDiv = document.createElement("div");
                newAuthorDiv.className = "messageAuthor";

                // Créer un nouveau paragraphe pour l'auteur du message
                const newAuthorP = document.createElement("p");
                newAuthorP.id = "messageAuthor";
                const newAuthorContent = document.createTextNode(pseudo);
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
            setIsLoading(false);
        };

    }, []);

    useEffect(() => {
        // Récupérer l'id du pseudo
        const fetchId_Pseudo = async () => {
            try {
                let pseudoCookies = Cookies.get('Pseudo')
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
            width="40px"
            height="40px"
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
                        <button className="button">Logout</button>
                    </div>
                </div>
            </div>

            <div className="pixiContainer">
                <div className="chatContainer">
                    <div className="chatContainer2">
                        <div className="messageAuthor">
                            <p id="messageAuthor" style={{margin: 0}}></p>
                        </div>
                        <div id="messageContainer">

                        </div>
                    </div>
                    <div className="chatContainer4">
                        <p id="erreurSend"></p>
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        {isLoading ? (
                            <div>
                                <Rolling/>
                                <p style={{
                                    margin: "0",
                                    display: "flex",
                                    justifyContent: "center",
                                    fontFamily: "Arial,ui-serif",
                                    fontSize: "15px"
                                }}>Chargement ...</p>
                            </div>
                        ) : (

                            <div className="chatContainer3">
                                <form style={{display: "flex", alignItems: "center"}} onSubmit={(e) => {
                                    e.preventDefault(); // Empêche le rechargement de la page
                                    sendMessage();
                                }}>
                                    <input className="inputsChat" maxLength="45" id="inputMessage"
                                           placeholder="écrire un message" required/>
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

                </div>
                <div ref={pixiContainer} className="pixi"></div>
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

export default PixiComponent;

