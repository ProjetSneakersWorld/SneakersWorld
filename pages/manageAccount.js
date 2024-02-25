import React, {useEffect, useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import '/public/manage.css';
import Swal from 'sweetalert2';
import { supabase } from './api/supabaseClient'
import {useRouter} from "next/router";
import Cookies from "js-cookie";

const ManageAccount = ({onClose}) => {
    const router = useRouter();
    const deleteAccount = async () => {
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.`
        );

        if (confirmed) {
            try {
                let pseudoCookies = Cookies.get('Pseudo')
                // Affichez une alerte non fermable pendant la suppression
                const deletingSwal = Swal.fire({
                    title: `Suppression du compte`,
                    text: 'Veuillez patienter...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    customClass: {
                        popup: 'my-swal-style', // Appliquez la classe CSS personnalisée
                    },
                });

                // Appeler la fonction fetch_messages_users_reactions
                let { data: results, error } = await supabase
                    .rpc('delete_data_by_pseudo', { pseudo_param: pseudoCookies });

                if (error) {
                    console.error('Erreur : ', error);
                    deletingSwal.close();
                    throw error;
                }

                if (results === true) {
                    console.log("Compte supprimé avec succès");
                } else if (results === false) {
                    console.log("Erreur : compte introuvable");
                }

                deletingSwal.close();
                Swal.fire({
                    text: `Votre compte a été supprimé avec succès.`,
                    customClass: {
                        popup: 'my-swal-style', // Appliquez la classe CSS personnalisée
                    },
                }).then(() => {
                    router.push('/logout')
                });
            } catch (err) {
                console.error("Error deleting account:", err);
                alert("Une erreur s'est produite lors de la suppression du compte.");
            }
        }
    }

    return (
        <div className="modal" id="modalAdmin">
            <div className="modal-content-manage">
                    <div>
                        <button className="buttonManage">Change email</button>
                        <button className="buttonManage" onClick={deleteAccount}>Delete my account</button>
                    </div>
                <div className="modal-content-close">
                    <button className="buttonChat" onClick={onClose}>
                        X
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageAccount;