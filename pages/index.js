import {useRouter} from "next/router";
import "../public/style.css"
import Head from "next/head";
import React from "react";


function Index() {
    const router = useRouter();

    const handleClick = (route) => {
        router.push(route);
    };

    return (
        <div>
            <Head>
                <title>Sneakers World</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <div className="body2">
                <div className="welcomDiv">
                    <h1 className="h1">Welcome to Sneakers World</h1>
                    <button className="button" onClick={() => handleClick('/login')}>Login</button>
                    <button className="button" onClick={() => handleClick('/signup')}>Signup</button>
                </div>
            </div>
        </div>
    );
}

export default Index;
