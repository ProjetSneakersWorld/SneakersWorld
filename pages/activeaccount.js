import React, { useEffect } from 'react';
import Head from "next/head";
import { useRouter } from 'next/router';
import CryptoJS from 'crypto-js';
import * as emailjs from "emailjs-com";

const activeaccount = () => {
    const router = useRouter();
    const { pseudo } = router.query;

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
        // const response = await fetch("/api/activeAccount", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     }
        // });
        //
        // if (response.status === 409) {
        //     console.log("te")
        // } else {
        //     console.log("zaer")
        // }

        const pseudo = 'test';
        const cipherPseudo = CryptoJS.AES.encrypt(pseudo, 'secret key 123').toString();
        try {
            const bytes = CryptoJS.AES.decrypt(cipherPseudo, 'secret key 123');
            const originalPseudo = bytes.toString(CryptoJS.enc.Utf8);
            console.log("Pseudo à activer : ", originalPseudo);
        } catch (e) {
            console.error(e);
        }


        // await emailjs.send("service_lkdqtpi", "template_s8i75vu", {
        //     to_name: pseudo,
        //     link: `http://localhost:3001/activeaccount?pseudo=${encodeURIComponent(cipherPseudo)}`,
        //     to_email: "binyam.elbaz@gmail.com",
        //
        // }, '3i0sNCTzHsxtb0REv')
        //     .then(() => {
        //         console.log('Sent!');
        //     }, (err) => {
        //         console.log(JSON.stringify(err));
        //     });
    }

    useEffect(() => {
        if (pseudo) {
            active();
        }
    }, [pseudo]);

    return (
        <div>
            <Head>
                <title>Activation de compte</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <div style={{background: "black", height: "100Vh"}}>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <button style={buttonStyle} onClick={()=> active()}>Activer mon compte</button>
                </div>
                <p id="activation"></p>
            </div>
        </div>
    )
}

export default activeaccount;
