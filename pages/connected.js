// connected.js
import jwt from 'jsonwebtoken';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

function ConnectedPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('TOKEN');
        // console.log("TEST token : "+token)
        if (!token) {
            // S'il n'y a pas de token, rediriger vers la page de connexion
            router.push('/login');
        } else {
            try {
                jwt.verify(token, 'secret_key', (err) => {
                    if (err) {
                        // console.error('Error verifying token:', err);
                        router.push('/login');
                    } else {
                        //aller chercher les infos user
                        // console.log('Token verified successfully:', decoded);
                        router.push('/phaser/Home');
                    }
                });
            } catch (err) {
                // En cas d'erreur de vérification, rediriger également vers la page de connexion
                // console.error("Error verifying token:", err);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }
    }, [router]);

    if (loading) {
        // Vous pouvez afficher un indicateur de chargement ici si nécessaire
        return <div>Loading...</div>;
    }
}

export default ConnectedPage;
