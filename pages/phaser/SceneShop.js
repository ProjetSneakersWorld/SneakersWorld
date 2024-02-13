import React, {useEffect, useState} from 'react';
import jwt from 'jsonwebtoken';
import '/public/Home.css';
import {createClient} from "@supabase/supabase-js";
import Cookies from "js-cookie";
import {toast, ToastContainer} from "react-toastify";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import GameComponent from "../../src/scenes/SceneShop"
import Chat from "../api/chat"
import {useRouter} from "next/router";

const Home = () => {
    const [isToken, setIsToken] = useState(false);
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
            document.getElementById("PseudoName").innerText = "Shop";
            // Récupérer l'id du pseudo
            const fetchId_Pseudo = async () => {
                // console.log(pseudoCookies)
                try {
                    let {data: id, error} = await supabase
                        .from('connexion')
                        .select('id, isActive') // Ajoutez isActive ici
                        .eq('pseudo', pseudoCookies);

                    if (error) throw error; // Si une erreur est renvoyée par supabase, la propager

                    setIsActive(id[0].isActive);
                    if (isActive) {
                    }
                } catch (error) {
                    console.error('Une erreur est survenue lors de la récupération de l\'ID :', error);
                    // Gérer l'erreur comme vous le souhaitez
                }
            }

            fetchId_Pseudo();


            // // Fonction pour uploader une image
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
            textAlign: "center",
            color: "white",
            paddingTop: "25px",
            fontSize: "35px",
            fontFamily: "Calibri"
        }}>Chargement ...</p>
        </div>);
    } else {
        return (
            <div>
                <Head>
                    <title>Shop</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
                </Head>
                <div style={{background: "black", height: "100Vh"}}>
                    <div className="divPixi">
                        <div className="pixiContainerTitle">
                            <p className="titre">Shop</p>
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
                                     onClick={() => router.push('/phaser/Home')}>
                                    <button className="buttonLogout">Retour</button>
                                </div>
                                <div className="buttonProfil">
                                    {isLoadAvatar ? Rolling(50, 50) :
                                        <img src={avatarSrc} width="50" height="50" alt=""/>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ContainerPrincipale">
                        <Chat place="shop" nameChat="Shop"/>
                        <div style={{display: "flex", alignItems: "center"}} onClick={() => {
                            document.getElementById("inputMessage").blur()
                        }}>
                            <GameComponent/>
                        </div>
                    </div>
                </div>
                )
                {isActive === false ? (<div className="modal">
                <div className="modal-content2">
                        <div style={{
                            flexDirection: "column", alignItems: "center", display: "flex", fontSize: "19px", color: "white"
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

