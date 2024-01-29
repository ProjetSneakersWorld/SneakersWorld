// pages/login.js
import React, {useEffect, useState} from 'react';
import "../public/style.css"
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import {useRouter} from "next/router";

const Login = ({ defaultIdf = '', defaultMdp = '' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('TOKEN');
        if (token) {
            // console.log("TEST token OK");
            try {
                jwt.verify(token, 'secret_key', (err) => {
                    if (err) {
                        // console.error('Error verifying token:', err);
                        router.push('/login');
                    } else {
                        // console.log('Token verified successfully:', decoded);
                        router.push('/phaser/Home');
                    }
                });
            } catch (err) {
                // En cas d'erreur de vérification, rediriger également vers la page de connexion
                // console.error("Error verifying token:", err);
                router.push('/login');
            }
        }
    }, [router]);

    const Rolling = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{
                margin: "auto",
                display: "block",
                shapeRendering: "auto",
            }}
            width="50px"
            height="50px"
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const idf = document.getElementById("idf").value;
        const mdp = document.getElementById("mdp").value;

        const response = await fetch("/api/home", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({idf, mdp}),
        });

        if (response.status === 200) {
            // Rediriger vers la page de connexion réussie
            // window.location.href = "/connected";
            await router.push("/connected");
        } else if (response.status === 401) {
            document.getElementById("error").innerText = "identifiant ou mot de passe incorrect";
        }
    };

    const handleClick = (route) => {
        router.push(route);
    };

    return (
        <div className="body">
            <div className="box">
                <p className="title">Login</p>
                <form action="/api/home" method="post" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="formlabel">
                            <label className="labels" form="login">Pseudo</label>
                            <label className="labels" form="password">Password </label>
                        </div>
                        <div className="formlabel">
                            <input className="inputs" type='text' id="idf" name="idf" maxLength="19" required
                                   autoComplete="username" defaultValue={defaultIdf}/>
                            <input className="inputs" type="password" id="mdp" name="mdp" maxLength="19" required
                                   autoComplete="current-password" defaultValue={defaultMdp}/>
                        </div>
                    </div>
                    <br/>
                    <button className="button" id="validInscription" type='submit' disabled={isLoading}>
                        {isLoading ? (
                            <div>
                                <Rolling/>
                            </div>
                        ) : (<>Connexion</>)}
                    </button>
                    <p id="error" className="error"></p>
                </form>
            </div>
            <div style={{paddingTop: "15px"}}>
                <button className="button" onClick={() => handleClick('/')}>Retour</button>
            </div>
        </div>);
};

export default Login;
