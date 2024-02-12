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

    return loading ? (
        <div>
            <Head>
                <title>Sneakers World</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <div>
                <p className="ChargementText">Déconnexion ...</p>
                {Rolling(80, 80, "#ffffff")}
            </div>
        </div>
    ) : null;
};

export default Logout;

