import React, {useEffect, useState} from 'react';
import jwt from 'jsonwebtoken';
import '/public/Home.css';
import {createClient} from "@supabase/supabase-js";
import Cookies from "js-cookie";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
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
        const token = document.cookie.replace(/(?:^|.*;\s*)TOKEN\s*=\s*([^;]*).*$|^.*$/, "$1");

        try {
            jwt.verify(token, 'secret_key');
            setIsToken(true);
        } catch (err) {
            // Redirigez vers la page d'accueil si le token n'est pas valide
            router.push('/login');
            setIsToken(false);
        }
    }, []);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //CODE Chat et gestion de le BD supabase
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let pseudoCookies = Cookies.get('Pseudo')
    const [isActive, setIsActive] = useState('null');
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [isLoadAvatar, setIsLoadAvatar] = useState(true);

    useEffect(() => {
        if (isToken) {
            document.getElementById("PseudoName").innerText = "Welcome, " + pseudoCookies;
            // Récupérer l'id du pseudo
            const fetchId_Pseudo = async () => {
                // console.log(pseudoCookies)
                try {
                    let {data: id, error} = await supabase
                        .from('connexion')
                        .select('id, isActive') // Ajoutez isActive ici
                        .eq('pseudo', pseudoCookies);

                    if (error) {
                        console.log("erreur : " + error)
                    }

                    setIsActive(id[0].isActive);
                    if (isActive) {
                    }
                } catch (error) {
                    console.error('Une erreur est survenue lors de la récupération de l\'ID :', error);
                    // Gérer l'erreur comme vous le souhaitez
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


    if (isToken === false) {
        return (<div><p style={{
            textAlign: "center", color: "black", paddingTop: "25px", fontSize: "35px", fontFamily: "Calibri"
        }}>Chargement ...</p>
        </div>);
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
                                        {isLoadAvatar ? Rolling(50, 50) :
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
                        <div style={{
                            flexDirection: "column",
                            alignItems: "center",
                            display: "flex",
                            fontSize: "19px",
                            color: "white",
                        }}>
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
                {isActive === false ? (<div className="modal">
                    <div className="modal-content2">
                        <div style={{
                            flexDirection: "column",
                            alignItems: "center",
                            display: "flex",
                            fontSize: "19px",
                            color: "white"
                        }}>
                            <p>Votre compte n'est pas activer</p>
                            <p>Allez dans vos mail activer le liens pour activer votre compte</p>
                            <button>Renvoyer un lien</button>
                        </div>
                    </div>
                </div>) : (<></>)}
            </div>);
    }
};

export default Home;

