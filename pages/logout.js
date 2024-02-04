// pages/logout.js
import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import {useState} from 'react';
import Head from "next/head";
import '/public/Home.css';

const Logout = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Supprime le cookie nommé 'TOKEN'
        document.cookie = 'TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'Pseudo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Attend 3 secondes avant de rediriger vers '/home'
        setTimeout(() => {
            setLoading(false);
            router.push('/');
        }, 2000); // 3000 millisecondes équivalent à 3 secondes
    }, []);

    return loading ? (
        <div>
            <Head>
                <title>Sneakers World</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <div>
                <p style={{
                    textAlign: "center",
                    color: "white",
                    paddingTop: "25px",
                    fontSize: "35px",
                    fontFamily: "Calibri"
                }}>Déconnexion ...</p>
            </div>
        </div>
    ) : null;
};

export default Logout;

