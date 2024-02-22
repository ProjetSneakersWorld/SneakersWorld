import React, { useEffect, useState } from 'react';
import '/public/online.css';
import { createClient } from '@supabase/supabase-js';
import moment from "moment-timezone";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Online = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const channel = supabase
            .channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'connexion' },
                (payload) => {
                    const newUser = payload.new;
                    const now = moment().tz("Europe/London").unix(); // Utilisez unix() pour obtenir le timestamp en secondes
                    if (newUser.isOnline) {
                        setOnlineUsers(prevUsers => {
                            // Ajouter ou mettre à jour l'utilisateur
                            const userIndex = prevUsers.findIndex(user => user.id === newUser.id);
                            if (userIndex > -1) {
                                // Mise à jour de l'utilisateur existant
                                const updatedUsers = [...prevUsers];
                                updatedUsers[userIndex] = { ...newUser, dateOnline: now };
                                return updatedUsers;
                            } else {
                                // Ajouter un nouvel utilisateur
                                return [...prevUsers, { ...newUser, dateOnline: now }];
                            }
                        });
                    } else {
                        // Retirer l'utilisateur qui est hors ligne
                        setOnlineUsers(prevUsers => prevUsers.filter(user => user.id !== newUser.id));
                    }
                }
            )
            .subscribe();

        // Vérifiez périodiquement le statut en ligne des utilisateurs
        const intervalId = setInterval(() => {
            const currentTimestamp = moment().tz("Europe/London").unix();
            setOnlineUsers(prevUsers =>
                prevUsers.filter(user => currentTimestamp - user.dateOnline <= 15)
            );
        }, 5000); // Mettre à jour toutes les 5 secondes

        // Nettoyage en cas de démontage du composant
        return () => {
            channel.unsubscribe();
            clearInterval(intervalId);
        };
    }, []); // Suppression de l'écoute sur les changements de onlineUsers

    return (
        <div style={{ position: "relative", left: "2rem" }}>
            <div className="online-container">
                <div style={{display: "flex", alignItems: "center"}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="1" fill="red">
                            <animate attributeName="r" values="1;7;2" dur="1.75s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    <p style={{marginLeft: "5px"}}>Online</p>
                </div>
                {onlineUsers.map(user => (
                    <div className="online-person" key={user.id}>
                        <p>{user.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Online;