// pages/signup.js
import React, {useRef, useState} from 'react';
import "../public/style.css"
import {router} from "next/router";
import Head from "next/head";
import * as emailjs from "emailjs-com";
import {createClient} from "@supabase/supabase-js";
import CryptoJS from "crypto-js";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const edit = "/images/edit.png"

const Signup = () => {
    const [pseudoError, setPseudoError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const checkPseudo = async () => {
        document.getElementById("validInscription").disabled = true;
        const pseudo = document.getElementById("Pseudo").value;

        const response = await fetch("/api/checkPseudo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({pseudo}),
        });

        if (response.status === 409) {
            setPseudoError("Ce pseudo existe déjà");
        }
        else {
            document.getElementById("validInscription").disabled = false;
            setPseudoError("");
        }
    };

    const checkEmail = async () => {
        document.getElementById("validInscription").disabled = true;
        const email = document.getElementById("Email").value;

        const response = await fetch("/api/checkEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
        });

        if (response.status === 409) {
            setEmailError("Cette email existe déjà");
        } else {
            if(document.getElementById("validInscription")){
                document.getElementById("validInscription").disabled = false;
                setEmailError("");
            }
        }
    };
    const submitSignup = async (event) => {
        setIsLoading(true);
        event.preventDefault();
        await uploadImage();
        const name = document.getElementById("Name").value;
        const lastName = document.getElementById("LastName").value;
        const pseudo = document.getElementById("Pseudo").value;
        const email = document.getElementById("Email").value;
        const newPassword = document.getElementById("NewPassword").value;

        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name, lastName, pseudo, email, newPassword}),
        });

        if (response.status === 200) {

                const response = await fetch("/api/connexionSignup", {
                    method: "POST", headers: {
                        "Content-Type": "application/json",
                    }, body: JSON.stringify({pseudo : document.getElementById("Pseudo").value}),
                });
                if(response.status === 200){
                    await sendEmailConfirmation();
                    // console.log("Réussi !!");
                    // Introduire un délai de 2 secondes avant de tenter de se connecter
                    // setTimeout(async () => {
                    //     await router.push("/connected");
                    // }, 2000); // 2000 millisecondes = 2 secondes

                }else {
                    console.log("ERREUR !!! Connexion");
                }

        } else if (response.status === 401) {
            setIsLoading(false);
            document.getElementById("error").innerText = "erreur";
        } else if (response.status === 409) {
            setIsLoading(false);
            document.getElementById("error").innerText = "pseudo deja existant";
        }
    };

    const sendEmailConfirmation =  async () => {
        console.log(document.getElementById('Pseudo').value)
        // get link activate
        const response = await fetch("/api/linkAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({pseudo: document.getElementById('Pseudo').value}),
        });

        const data = await response.json();

        if (response.status === 500) {
            console.log('erreur : '+response.status)
        } else {
            console.log("liens : " +data.data)
        }
        // send mail
        await emailjs.send("service_lkdqtpi", "template_s8i75vu", {
            to_name: document.getElementById('Pseudo').value,
            link: `https://sae0.vercel.app${data.data}`,
            to_email: document.getElementById('Email').value,

        }, '3i0sNCTzHsxtb0REv')
            .then(() => {
                const notify = () => toast("Email Envoyé");
                notify();
                document.getElementById("validInscription").innerHTML = '<img width="35" height="35" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAACuUlEQVR4nO2cy24TMRSGR5QV0B2SYZXjcrHUlyg8BA+BBGxhV5ZIbGNHgT5BX4BLxUVN+w4I2KOqG/DprpRBHkgVFBHl4pkzyfk/yVLVVIrP93vsGcdNUQAAAAAAAAAAAAAAAAAAAIAxOt2Taxu9H7fczvH6+KugFra2y4sU+BF5/moDl1Xz8af18UOnx3fqeVdQsdk9ukI+vj0XP9biGYX4+M9fg6yY598up1H+f/n/tGd53105Zjb5CCH7tBN4MKP8qm2E+CRrZ7SxuYD88zXBxy3pOpTK56qRj++ka1Er36YAQjxNa4h0TSrl27/tRvf7Tem61Mq3gcvb/XhVurbW43aO1+uQbz1/kq5Nr/xQ3Yrel65PrXwb4qtit1yTrnHVnnDLqe5+PB9gl3QCkC+IwciHfJUYjHzIV4nById8lRiMfMhvjPTUl87IpLMyq7y9QJ73065p0RY6nu/awB+rszHDTgb+Qp4fpjM0TffHaZKfPnS2Pv6asBn1pskOO03yreenU3U88GETm1JG04I7rfymQjCa5FfTzjyFBB7UcQk7fQtuPJu7oMCDnKPJaZKfyHGZ5wrBaZOfCh691ZQMwWmTn0gPWVkLnTMEp1F+wr5kk73gGUNwWuUPIc+fpUJw2uUnbI8f1CIgTA4B8ofslmvWx9dNhuDSyPd8oHrkj3K9X16yIb6vKYTD0RBUPeG2LQQD+dP8xyDv1zU6CdOO7JVgMe3IT0cWc/5qhEDLvOAuewikQX5bQyBN8tsWAmmU35YQSLN86RAI8uVCIMiXuxII8uWmI4J8uTWBIF9uYSbInzOEHMdbPG4152bRvX6CfLkQCPLlQiDIlwuBIF8uBIL8pr6tKu6NyQ9xb+mOjiwt2+UFG/ieDfzCBu6nn9PvpLsFAAAAAAAAAAAAAAAAAAAAACgW5DfQ3rK+XjmIMQAAAABJRU5ErkJggg==" alt=""/>';
                document.getElementById("Name").value = '';
                document.getElementById("LastName").value = '';
                document.getElementById("Pseudo").value = '';
                document.getElementById("Email").value = '';
                document.getElementById("NewPassword").value = '';
            }, (err) => {
                console.log("Erreur : "+JSON.stringify(err));
            });
    }

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

    const fileInput = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [avatar, setAvatar] = useState('/images/avatar.svg');

    const loadAvatar = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedFile(file);
            const fileUrl = URL.createObjectURL(file);
            setAvatar(fileUrl);
        }
    };

    const uploadImage = async () => {
        let fileToUpload = selectedFile;

        if (!fileToUpload) {
            console.log('Aucun avatar sélectionné, chargement de l\'avatar par défaut');
            // Utilisez fetch pour obtenir le contenu de l'image
            const response = await fetch(avatar);
            fileToUpload = await response.blob();
        }

        const {data, error} = await supabase
            .storage
            .from('SneakersWorld')
            .upload(document.getElementById("Pseudo").value +"_avatar.png", fileToUpload, {
                cacheControl: '3600', upsert: true,
            })

        if (error) {
            console.error('Erreur lors de l\'upload de l\'image : ', error)
        } else {
            console.log('Image uploadée avec succès : ', data)
        }
    };


    return (<div>
        <Head>
            <title>Sneakers World</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <div className="body">
            <div className="box">
                <p className="title">Signup</p>
                <form action="/api/home" method="post" onSubmit={submitSignup}>
                    <div className="avatarContainer" onClick={() => fileInput.current.click()}>
                        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        </div>
                        <div style={{position: 'relative', width: '85px', height: '85px'}}>
                            <img src={avatar} alt="" className="avatar"
                                 style={{objectFit: selectedFile ? "scale-down" : "cover",}}/>
                            <img src={edit} alt="" className="edit"
                                 style={{visibility: selectedFile ? "hidden" : "visible"}}/>
                        </div>
                        <p style={{margin: 0, paddingTop: "2px"}}>Avatar</p>
                        <input ref={fileInput} type="file" style={{display: 'none'}} accept=".png, .jpeg"
                               onChange={loadAvatar}/>
                    </div>
                    <div className="form-group">
                        <div className="formlabel">
                            <label className="labelsSignup" form="name">Name</label>
                            <label className="labelsSignup" form="lastName">LastName</label>
                            <label className="labelsSignup" form="pseudo">Pseudo</label>
                            <label style={{paddingTop: emailError ? "35px" : "0.8rem"}} className="labelsSignup"
                                   form="email">Email</label>
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
                            <input className="inputsSignup" type='email' id="Email" maxLength="26" required
                                   onChange={checkEmail}/>
                            <div>
                                <p style={{color: "red", fontSize: "15px", margin: "0"}}>{emailError}</p>
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
                        ) : (<>Inscription</>)}
                    </button>
                    <p id="error" className="error"></p>
                </form>
            </div>
            <div style={{paddingTop: "15px"}}>
                <button className="button" onClick={() => handleClick('/')}>Retour</button>
            </div>
            <div>
                <ToastContainer/>
            </div>
        </div>
    </div>);
};

export default Signup;
