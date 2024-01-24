// pages/login.js
import React, {useEffect} from 'react';
import "../public/style.css"
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import {useRouter} from "next/router";

const Login = () => {
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
                        router.push('/pixi/Home');
                    }
                });
            } catch (err) {
                // En cas d'erreur de vérification, rediriger également vers la page de connexion
                // console.error("Error verifying token:", err);
                router.push('/login');
            }
        }
    }, [router]);

    const handleSubmit = async (event) => {
        event.preventDefault();

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
                <p className="title">Login Form</p>
                <form action="/api/home" method="post" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="formlabel">
                            <label className="labels" form="login">Pseudo</label>
                            <label className="labels" form="password">Password </label>
                        </div>
                        <div className="formlabel">
                            <input className="inputs" type='text' id="idf" name="idf" maxLength="19" required
                                   autoComplete="username"/>
                            <input className="inputs" type="password" id="mdp" name="mdp" maxLength="19" required
                                   autoComplete="current-password"/>
                        </div>
                    </div>
                    <br/>
                    <button className="button" type='submit'>Connexion</button>
                    <p id="error" className="error"></p>
                </form>
            </div>
            <div style={{paddingTop: "15px"}}>
                <button className="button" onClick={() => handleClick('/')}>Retour</button>
            </div>
        </div>);
};

export default Login;
