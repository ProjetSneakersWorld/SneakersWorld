import React, { useEffect, useState } from 'react';
import '/public/online.css';
import { supabase } from '../api/supabaseClient';
import moment from 'moment-timezone';

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
                    const now = moment().tz("Europe/Paris").unix(); // Utilisez unix() pour obtenir le timestamp en secondes
                    setOnlineUsers(prevUsers => {
                        const userIndex = prevUsers.findIndex(user => user.id === newUser.id);
                        if (newUser.isOnline) {
                            if (userIndex > -1) {
                                // Mise à jour de l'utilisateur existant
                                const updatedUsers = [...prevUsers];
                                updatedUsers[userIndex] = { ...newUser, dateOnline: now };
                                return updatedUsers;
                            } else {
                                // Ajouter un nouvel utilisateur
                                return [...prevUsers, { ...newUser, dateOnline: now }];
                            }
                        } else {
                            // Retirer l'utilisateur qui est hors ligne
                            return prevUsers.filter(user => user.id !== newUser.id);
                        }
                    });
                }
            )
            .subscribe();

        const intervalId = setInterval(() => {
            const currentTimestamp = moment().tz("Europe/Paris").unix();
            setOnlineUsers(prevUsers =>
                prevUsers.filter(user => currentTimestamp - user.dateOnline <= 15)
            );
        }, 5000);

        return () => {
            supabase.removeChannel(channel); // Nettoyage du canal
            clearInterval(intervalId); // Nettoyage de l'intervalle
        };
    }, []);

    return (
        <div style={{ position: "relative", left: "2rem" }}>
            <div className="online-container">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="1" fill="red">
                            <animate attributeName="r" values="1;7;2" dur="1.75s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                    <p style={{ marginLeft: "5px" }}>Online</p>
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
