// pages/signup.js
import React, {useState} from 'react';
import "../public/style.css"
import {router} from "next/router";

const Signup = () => {
    const [pseudoError, setPseudoError] = useState("");
    const checkPseudo = async (event) => {
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
            setPseudoError("");
        }
    };
    const submitSignup = async (event) => {
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

        if (response.status === 200) {
            // Rediriger vers la page pixi
            router.push('/login');
            console.log("Inscription réussi")
        } else if (response.status === 401) {
            document.getElementById("error").innerText = "erreur";
        } else if (response.status === 409) {
            document.getElementById("error").innerText = "pseudo deja existant";
        }
    };

    const handleClick = (route) => {
        router.push(route);
    };

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
                            <label style={{paddingTop: pseudoError ? "35px" : "0.8rem"}} className="labelsSignup" form="password">Password</label>
                        </div>
                        <div className="formlabel">
                            <input className="inputsSignup" type='text' id="Name" maxLength="19" required/>
                            <input className="inputsSignup" type='text' id="LastName" maxLength="19" required/>
                            <input className="inputsSignup" type='text' id="Pseudo" maxLength="19" required
                                   onChange={checkPseudo}/>
                            <div>
                                <p style={{color: "red", fontSize: "15px", margin:"0"}}>{pseudoError}</p>
                            </div>
                            <input className="inputsSignup" type="password" id="NewPassword" maxLength="19" required
                                   autoComplete="current-password"/>
                        </div>
                    </div>
                    <br/>
                    <button className="button" type='submit'>Inscription</button>
                    <p id="error" className="error"></p>
                </form>
            </div>
            <div style={{paddingTop: "15px"}}>
                <button className="button" onClick={() => handleClick('/')}>Retour</button>
            </div>
        </div>);
};

export default Signup;
