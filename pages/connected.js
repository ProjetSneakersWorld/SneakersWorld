// connected.js
import jwt from 'jsonwebtoken';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Head from "next/head";

function ConnectedPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch('/api/checkToken', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({token: Cookies.get('TOKEN')}),
                });

                const { valid } = await response.json();

                if (valid) {
                    // Token valide, rediriger vers la page phaser Home
                    await router.push('/phaser/Home');
                } else {
                    // Token invalide ou expiré, rediriger vers la page de connexion
                    await router.push('/login');
                }
            } catch (error) {
                console.error('Error while checking token: ', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [router]);

    if (loading) {
        // Vous pouvez afficher un indicateur de chargement ici si nécessaire
        return (
            <div>
                <Head>
                    <title>Loading ...</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
                </Head>
                <div>Loading...</div>
            </div>
        );
    }
}

export default ConnectedPage;
