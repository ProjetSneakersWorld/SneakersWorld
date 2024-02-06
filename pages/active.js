import React, {useEffect, useState} from 'react';
import Head from "next/head";
import { useRouter } from 'next/router';
import CryptoJS from 'crypto-js';
import "/public/style.css"
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const active = () => {
    const router = useRouter();
    const { pseudo } = router.query;
    const [originalPseudo, setOriginalPseudo] = useState(null);
    const notify = (text) => toast(text);


    const buttonStyle = {
        backgroundColor: '#4CAF50', /* Green */
        border: 'none',
        color: 'white',
        padding: '15px 32px',
        textAlign: 'center',
        textDecoration: 'none',
        fontSize: '16px',
        margin: '4px 2px',
        cursor: 'pointer',
        borderRadius: '15px',
    };

    const active = async () => {
        if(originalPseudo !== null){
            const response = await fetch("/api/activeAccount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({pseudo:originalPseudo}),
            });

            if (response.status === 200) {
                console.log("activation réussi");
                notify("Compte activé avec succes");
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                console.log("Erreur lors de l'activation");
                notify("Erreur lors de l'activation");
            }
        }
    }

    useEffect(() => {
        try {
            // Récupérer le token du lien
            const urlParams = new URLSearchParams(window.location.search);
            const cipherPseudo = urlParams.get('token');

            const bytes = CryptoJS.AES.decrypt(cipherPseudo, 'CléSecreTpour0Chiffrer1lePSeudo');
            setOriginalPseudo(bytes.toString(CryptoJS.enc.Utf8));
            // console.log("Pseudo à activer : ", originalPseudo);
        } catch (e) {
            console.error(e);
        }
    }, []);

    return (
        <div style={{height: "100Vh"}}>
            <Head>
                <title>Activation de compte</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <div>
                <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
                    <div>
                        <p style={{
                            color: "white",
                            fontFamily: 'Arial',
                            fontSize: "25px",
                            paddingTop: "15px",
                            paddingBottom: "32px"
                        }}>Bonjour {originalPseudo}</p>
                    </div>
                    <div>
                        <button style={buttonStyle} onClick={() => active()}>Activer mon compte</button>
                    </div>
                </div>
                <p id="activation"></p>
            </div>
            <div>
                <ToastContainer/>
            </div>
        </div>
    )
}

export default active;
