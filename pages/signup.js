// pages/signup.js
import React, {useState} from 'react';
import "../public/style.css"
import {router} from "next/router";

const Signup = () => {
    const [pseudoError, setPseudoError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const checkPseudo = async (event) => {
        document.getElementById("validInscription").disabled = true;
        const pseudo = event.target.value;

        const response = await fetch("/api/checkPseudo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pseudo }),
        });

        if (response.status === 409) {
            setPseudoError("Ce pseudo existe déjà");
        } else {
            document.getElementById("validInscription").disabled = false;
            setPseudoError("");
        }
    };
    const submitSignup = async (event) => {
        setIsLoading(true);
        event.preventDefault();

        const name = document.getElementById("Name").value;
        const lastName = document.getElementById("LastName").value;
        const pseudo = document.getElementById("Pseudo").value;
        const newPassword = document.getElementById("NewPassword").value;

        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name, lastName, pseudo, newPassword}),
        });

        let idf = pseudo;
        let mdp = newPassword;
        if (response.status === 200) {
            // Introduire un délai de 2 secondes avant de tenter de se connecter
            setTimeout(async () => {
                const response = await fetch("/api/home", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({idf, mdp}),
                });

                if (response.status === 200) {
                    setIsLoading(false);
                    // Rediriger vers la page de connexion réussie
                    await router.push("/connected");
                } else if (response.status === 401) {
                    document.getElementById("error").innerText = "identifiant ou mot de passe incorrect";
                }
            }, 2000); // 2000 millisecondes = 2 secondes
        } else if (response.status === 401) {
            document.getElementById("error").innerText = "erreur";
        } else if (response.status === 409) {
            document.getElementById("error").innerText = "pseudo deja existant";
        }
    };

    const handleClick = (route) => {
        router.push(route);
    };

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

    return (
        <div className="body">
            <div className="box">
                <p className="title">Signup</p>
                <form action="/api/home" method="post" onSubmit={submitSignup}>
                    <div className="form-group">
                        <div className="formlabel">
                            <label className="labelsSignup" form="name">Name</label>
                            <label className="labelsSignup" form="lastName">LastName</label>
                            <label className="labelsSignup" form="pseudo">Pseudo</label>
                            <label style={{paddingTop: pseudoError ? "35px" : "0.8rem"}} className="labelsSignup"
                                   form="password">Password</label>
                        </div>
                        <div className="formlabel">
                            <input className="inputsSignup" type='text' id="Name" maxLength="19" required/>
                            <input className="inputsSignup" type='text' id="LastName" maxLength="19" required/>
                            <input className="inputsSignup" type='text' id="Pseudo" maxLength="19" required
                                   onChange={checkPseudo}/>
                            <div>
                                <p style={{color: "red", fontSize: "15px", margin: "0"}}>{pseudoError}</p>
                            </div>
                            <input className="inputsSignup" type="password" id="NewPassword" maxLength="19" required
                                   autoComplete="current-password"/>
                        </div>
                    </div>
                    <br/>
                    <button className="button" id="validInscription" type='submit' disabled={isLoading}>
                        {isLoading ? (
                            <div>
                                <Rolling/>
                            </div>
                        ) : (<p>Inscription</p>)}
                    </button>
                    <p id="error" className="error"></p>
                </form>
            </div>
            <div style={{paddingTop: "15px"}}>
                <button className="button" onClick={() => handleClick('/')}>Retour</button>
            </div>
        </div>);
};

export default Signup;
