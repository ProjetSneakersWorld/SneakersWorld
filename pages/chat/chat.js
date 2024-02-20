import React, {useContext, useEffect, useState} from 'react';
import '/public/Home.css';
import {createClient} from "@supabase/supabase-js";
import Cookies from "js-cookie";
import moment from 'moment-timezone';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {InputFocusContext} from "../../src/InputFocusContext";
import {GameContext} from "../../src/GameContext";

const sendImage = "/images/send.png"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const chat = (place) => {
    const {isInputFocused, setInputFocused} = React.useContext(InputFocusContext);
    let lastAuthor = null;
    let pseudoCookies = Cookies.get('Pseudo');
    const {currentScene} = useContext(GameContext);
    const notify = (text) => toast(text);
    const [id_USER, setId_USER] = useState('null');
    const [isActive, setIsActive] = useState('null');
    const [isLoading, setIsLoading] = useState(true);
    const [isSendMessage, setIsSendMessage] = useState(false);

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
    }, []);

    useEffect(() => {
        let messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) {
            // Créer l'élément s'il n'existe pas
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';

            // Trouver l'élément parent
            var chatContainerMessage = document.getElementById('chatContainerMessage');

            // Si l'élément parent existe, ajouter l'élément créé en tant que son enfant
            if (chatContainerMessage) {
                chatContainerMessage.appendChild(messageContainer);
            } else {
                // Si l'élément parent n'existe pas, créer un div avec cet ID et l'ajouter au corps du document
                chatContainerMessage = document.createElement('div');
                chatContainerMessage.id = 'chatContainerMessage';
                document.body.appendChild(chatContainerMessage);
                chatContainerMessage.appendChild(messageContainer);
            }
        } else {
            // S'il existe déjà, vider tous ses éléments enfants
            // while (messageContainer.firstChild) {
            //     messageContainer.removeChild(messageContainer.firstChild);
            // }
        }

        const fetchMessagesAndUsers = async () => {
            let currentDate = new Date();
            let pastDate = new Date();
            pastDate.setHours(currentDate.getHours() - 24);

            // Appeler la fonction fetch_messages_users_reactions
            let {data: results, error} = await supabase
                .rpc('fetch_messages_users_reactions', {place: place.place});

            if (error) {
                console.error('Erreur lors de la récupération des données:', error);
                return;
            }

            if (results.length === 0) {
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

            results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            // console.log(results)
            for (let result of results) {
                const pseudo = result.author_pseudo;
                const date = new Date(result.message_timestamp);
                let formattedTime = `${date.getHours()}h${date.getMinutes().toString().padStart(2, '0')}`;

                // Récupérer les emojis associés au message
                const emojis = result.emojis;
                // if (emojis) {
                //     console.log(`Message: ${result.message}, id : ${result.id}, Emojis: ${emojis}`);
                // }

                displayMessage(result.id, pseudo, formattedTime, result.message, emojis, true);

            }
        };

        fetchMessagesAndUsers();

        //TODO A QUOI SA SERT (PEUT PEUT ETRE ETRE SUPPRIME !!)
        let dateOnlineByPseudo = "";
        const fetchPseudoAndDateOnline = async () => {
            // Récupère la date actuelle de dateOnline pour tous les utilisateurs
            let {data: users, error} = await supabase
                .from('connexion')
                .select('pseudo, dateOnline');
            if (error) {
                console.error('Erreur lors de la récupération id du pseudo :', error);
                return;
            }
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
                if (payload.new.id_user !== id_USER) {
                    console.log("C'est toi qui a envoyé : " + payload.new.id_user);
                    displayMessage(payload.new.id, pseudo, date.getHours() + "h" + date.getMinutes(), payload.new.message, null);
                }
                setIsLoading(false);
            })
            // A chaque mise à jour dans la table reaction
            .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'reaction'}, async (payload) => {
                if (payload.new.place === place.place) {
                    // Récupérer l'ID du message auquel la réaction a été ajoutée
                    const messageId = payload.new.message_id;

                    // Récupérer les emojis existants pour ce message
                    const reactions = await fetchReactionsByMessageId(messageId);

                    // Mettre à jour les emojis pour le message spécifique
                    const existingEmojisChat = document.getElementById("emojis-" + messageId);
                    if (existingEmojisChat) {
                        const emojisChatP = existingEmojisChat.querySelector("p");
                        if (emojisChatP) {
                            emojisChatP.innerText = reactions; // Mettre à jour le texte des emojis
                        }
                    }

                    // Trigger a UI update for the updated reactions
                    setIsLoading(false);
                }
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
            .subscribe();
    }, [currentScene, isLoading]);

    const fetchReactionsByMessageId = async (messageId) => {
        try {
            let { data: reactions, error } = await supabase
                .from("reaction")
                .select("emojis")
                .eq("message_id", messageId);
            if (error) throw error;
            let allEmojis = reactions.map((reaction) => reaction.emojis);
            return allEmojis.join(' ');
        } catch (error) {
            console.error("Erreur lors de la récupération des réactions :", error);
        }
    };

    // Fonction pour afficher un message
    const displayMessage = (idMessage, pseudo, dateMessage, message, emojis, firstMessage) => {
        const existingMessage = document.getElementById(idMessage);
        if (existingMessage) {
            // Update the existing message element
            existingMessage.innerHTML = message;

            // Update the existing emojis element
            const existingEmojisChat = document.getElementById("emojis-" + idMessage);
            if (existingEmojisChat) {
                const emojisChatP = existingEmojisChat.querySelector("p");
                if (emojisChatP) {
                    emojisChatP.innerText = emojis;
                }
            }
            setIsLoading(false);
        } else {
            if (pseudo !== pseudoCookies || firstMessage === true) {
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

                // Mettre à jour l'auteur du dernier message
                lastAuthor = pseudo;

                // Créer une nouvelle div pour le message
                const newMessageDiv = document.createElement("div");
                newMessageDiv.style.background = "rgb(103, 194, 98)";
                newMessageDiv.style.userSelect = "none";
                newMessageDiv.style.color = "white";
                newMessageDiv.className = "messageContainer";
                // Créer un nouveau paragraphe pour le message
                const newMessageP = document.createElement("p");
                newMessageP.id = idMessage;
                const newMessageContent = document.createTextNode(message);
                newMessageP.appendChild(newMessageContent);

                // Ajouter le paragraphe à la div du message
                newMessageDiv.appendChild(newMessageP);

                // Créer une nouvelle div pour contenir l'auteur et le message
                const newParentDiv = document.createElement("div");
                newParentDiv.className = "parentContainer";
                newParentDiv.style.display = "flex";
                newParentDiv.style.flexDirection = "column";
                newParentDiv.style.alignItems = "flex-start";

                let fontSize = window.getComputedStyle(document.body).getPropertyValue('font-size');
                fontSize = parseFloat(fontSize);
                if (pseudo === pseudoCookies) {
                    newMessageDiv.style.background = "rgb(50, 121, 249)";
                    newParentDiv.style.alignItems = "flex-end";
                    newMessageDiv.style.borderRadius = Math.ceil(fontSize * 1.35) + "px " + Math.ceil(fontSize * 1.35) + "px 0px " + Math.ceil(fontSize * 1.35) + "px";
                } else {
                    newMessageDiv.style.borderRadius = Math.ceil(fontSize * 1.35) + "px " + Math.ceil(fontSize * 1.35) + "px " + Math.ceil(fontSize * 1.35) + "px 0px";
                }
                newParentDiv.appendChild(newAuthorDiv);
                //div avec le message et l'emojis
                const divMessageContainer = document.createElement("div");
                divMessageContainer.style.display = "flex";
                divMessageContainer.style.flexDirection = "row";
                if (pseudo === pseudoCookies) {
                    divMessageContainer.style.flexDirection = "row-reverse";
                }
                divMessageContainer.style.gap = "5px";
                divMessageContainer.appendChild(newMessageDiv);


                //
                const divEmojisChat = document.createElement("div");
                divEmojisChat.id = "emojis-" + idMessage;
                divEmojisChat.style.display = "flex";
                divEmojisChat.style.alignItems = "center";
                const emojisChat = document.createElement("p");
                emojisChat.innerText = emojis;
                divEmojisChat.appendChild(emojisChat);
                divMessageContainer.appendChild(divEmojisChat);

                newParentDiv.appendChild(divMessageContainer);

                // Liez un écouteur d'événement 'click' à chaque émoji
                const bindEmojiClickListener = (emojiContainer) => {
                    const emojisSpans = emojiContainer.querySelectorAll(".emojisSpan");
                    emojisSpans.forEach((emojiSpan) => {
                        emojiSpan.addEventListener("click", (event) => logEmojiAndMessageId(event, idMessage));
                    });
                };

                // Créer un nouveau composant avec des emojis
                const emojiComponent = createEmojiComponent();
                emojiComponent.className = "emojisContainer";
                bindEmojiClickListener(emojiComponent); // Liaison de l'écouteur d'événement click

                // Ajouter le composant emoji à newMessageDiv au lieu de newParentDiv
                newParentDiv.appendChild(emojiComponent);

                // Ajouter des écouteurs d'événements 'mouseover' et 'mouseout' à newMessageDiv au lieu de newParentDiv
                newMessageDiv.addEventListener("mouseover", () => showEmoji(emojiComponent));
                newMessageDiv.addEventListener("mouseout", () => hideEmoji(emojiComponent));
                // Ajouter des écouteurs d'événements 'mouseover' et 'mouseout' à emojiComponent
                emojiComponent.addEventListener("mouseover", () => showEmoji(emojiComponent));
                emojiComponent.addEventListener("mouseout", () => hideEmoji(emojiComponent));

                function showEmoji(element) {
                    element.style.visibility = "visible";
                }

                function hideEmoji(element) {
                    element.style.visibility = "hidden";
                }
                document.getElementById('messageContainer').width="100%";
                document.getElementById('messageContainer').appendChild(newParentDiv);
            }

            setIsLoading(false);
            if (message.length !== 0) {
                // Après avoir ajouté un nouveau message au conteneur
                let chatContainer = document.querySelector('.chatContainer2');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }
        }
    }

    const sendMessage = async () => {
        let message = document.getElementById('inputMessage').value;
        document.getElementById('inputMessage').innerText = "";
        if (document.getElementById('messageVideP')) {
            document.getElementById('messageVideP').remove();
        }
        if (id_USER === null || id_USER === undefined) {
            console.log("erreur lors de la recuperation de l'id du pseudo !!")
        } else {
            if (message === "") {
                document.getElementById("erreurSend").innerText = "Message vide !";
            } else {
                setIsSendMessage(true);
                setIsLoading(true);
                try {
                    await supabase
                        .from('message')
                        .insert([{
                            id_user: id_USER,
                            message: message,
                            timestamp: moment().tz('Europe/Paris').format(),
                            place: place.place
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

    const logEmojiAndMessageId = async (event, idMessage) => {
        setIsLoading(true);
        const clickedEmoji = event.target.innerText;
        // console.log(`Clicked emoji: ${clickedEmoji}, Message ID: ${idMessage}`);

        const {error} = await supabase
            .from('reaction')
            .insert([
                {emojis: clickedEmoji, pseudo: pseudoCookies, message_id: idMessage, place: place.place},
            ])
            .select()
        if (error) {
            console.error('Erreur database :', error);
        }
    };

    const createEmojiComponent = () => {
        const emojiContainer = document.createElement("span");
        emojiContainer.classList.add("emoji-container");
        const emojis = ["👍", "😂", "😍", "😎", "🥳"];
        for (let i = 0; i < emojis.length; i++) {
            const emojiSpan = document.createElement("span");
            emojiSpan.className = "emojisSpan";
            emojiSpan.textContent = emojis[i];
            emojiContainer.append(emojiSpan);
        }
        return emojiContainer;
    };
    const Rolling = (w, h) => (<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{
            margin: "0", display: "block", shapeRendering: "auto",
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

    return (<div style={{display: "flex", alignItems: "stretch"}} id="chatContainer">
        <div className="chatContainer" style={{border: isInputFocused ? "5px solid white" : ""}}>
            <div style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%"}}>
                <div style={{display: "flex", justifyContent: "center", fontFamily: "Arial"}}>
                    <p style={{fontSize: "20px"}}>{place.nameChat}</p>
                </div>
                <div className="chatContainer2" id="chatContainer2" style={{height: "73VH", paddingTop: "10px"}}>
                    <div id="chatContainerMessage" style={{display: "contents"}}>
                        <div className="messageAuthor">
                            <p id="messageAuthor" style={{margin: 0}}></p>
                        </div>
                        <div id="messageContainer" className="containerChatMessage">

                        </div>

                    </div>
                </div>
                {isLoading ? (<div className="chatContainer3">
                    {Rolling(40, 40)}
                    <p id="textMessage" style={{
                        marginBottom: "0",
                        margin: 0,
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
                            <input
                                className="inputsChat"
                                maxLength="75"
                                id="inputMessage"
                                placeholder="envoyer un message"
                                required
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                onKeyDown={(event) => {
                                    // Arrête la propagation de l'événement pour empêcher le jeu de le recevoir
                                    event.stopPropagation();
                                }}
                            />


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
        <div>
            <ToastContainer/>
        </div>
    </div>);
};

export default chat;
