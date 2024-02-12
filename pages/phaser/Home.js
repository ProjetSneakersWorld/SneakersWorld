import React, {useEffect, useState} from 'react';
import '/public/Home.css';
import Cookies from "js-cookie";
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import GameComponent from "../../src/scenes/SceneMain"
import {useRouter} from "next/router";
import Chat from "../chat/chat"
import {InputFocusContext} from "../../src/InputFocusContext";

const Home = () => {
    const [isToken, setIsToken] = useState(false);
    const [isInputFocused, setInputFocused] = React.useState(false);
    const router = useRouter();

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
                img.onerror = (error) => {
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


    if (isToken === false || isActive === "null") {
        return (
            <div>
                <p className="ChargementText">Chargement ...</p>
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
                <InputFocusContext.Provider value={{isInputFocused, setInputFocused}}>
                    <div style={{background: "black", height: "100Vh"}}>
                        <div className="divPixi">
                            <div className="pixiContainerTitle">
                                <p className="titre">Sneakers World</p>
                                <p id="PseudoName" className="pseudo"></p>
                            </div>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <div style={{
                                    marginLeft: "auto",
                                    paddingRight: "15px",
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                    <div style={{
                                        marginLeft: "auto", paddingRight: "15px", display: "flex", alignItems: "center"
                                    }}
                                         onClick={() => router.push('/logout')}>
                                        <button className="buttonLogout">Logout</button>
                                    </div>
                                    <div className="buttonProfil">
                                        {isLoadAvatar ? Rolling(50, 50, "#000000") :
                                            <img src={avatarSrc} width="50" height="50" alt=""/>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ContainerPrincipale">
                            <Chat place="home" nameChat="Chat Principal"/>
                            <div style={{display: "flex", alignItems: "center"}} onClick={() => {
                                if (document.getElementById("inputMessage")) {
                                    document.getElementById("inputMessage").blur()
                                }
                            }}>
                                <GameComponent/>
                            </div>
                        </div>
                        <div className="help"
                             onClick={() => document.getElementById('modalHelp').style.display = "block"}>
                            <img src="/images/aide.png" width="75" height="75" alt=""/>
                        </div>
                    </div>
                </InputFocusContext.Provider>
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

export default Home;

