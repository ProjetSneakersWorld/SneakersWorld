import React, {useEffect, useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import '/public/manage.css';
import Swal from 'sweetalert2';
import {supabase} from './api/supabaseClient'
import {useRouter} from "next/router";
import Cookies from "js-cookie";

const ManageAccount = ({ onClose }) => {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const changeEmail = async () => {
        const { value: newEmail } = await Swal.fire({
            title: 'Changer d\'email',
            input: 'email',
            inputLabel: 'Entrez votre nouvelle adresse email',
            inputPlaceholder: 'Nouvelle adresse email',
            showCancelButton: true,
            customClass: {
                popup: 'my-swal-style arial-text-modal',
                title: 'arial-text-modal',
                content: 'arial-text-modal',
                confirmButton: 'arial-text-modal',
                cancelButton: 'arial-text-modal'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'Vous devez écrire quelque chose !';
                }
            }
        });

        if (newEmail) {
            try {
                const pseudoCookies = Cookies.get('Pseudo');
                const { data, error } = await supabase
                    .rpc('update_email_by_pseudo', {
                        pseudo_param: pseudoCookies,
                        new_email: newEmail
                    });

                if (error) {
                    throw error;
                }
                await Swal.fire({
                    title: 'Succès',
                    text: 'Votre email a été mis à jour.',
                    icon: 'success',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
                setEmail(newEmail);  // Met à jour l'état avec le nouvel email
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'email :', error);
                await Swal.fire({
                    title: 'Erreur',
                    text: 'Une erreur est survenue lors de la mise à jour de votre email.',
                    icon: 'error',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
            }
        }
    };

    const deleteAccount = async () => {
        const { isConfirmed } = await Swal.fire({
            title: 'Confirmation de suppression',
            text: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            customClass: {
                popup: 'my-swal-style',
            },
        });

        if (isConfirmed) {
            try {
                let pseudoCookies = Cookies.get('Pseudo');
                const deletingSwal = Swal.fire({
                    title: 'Suppression du compte',
                    text: 'Veuillez patienter...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });

                let { data: results, error } = await supabase
                    .rpc('delete_data_by_pseudo', { pseudo_param: pseudoCookies });

                if (error) {
                    deletingSwal.close();
                    throw error;
                }

                if (results === true) {
                    deletingSwal.close();
                    Swal.fire({
                        title: 'Succès',
                        text: 'Votre compte a été supprimé avec succès.',
                        icon: 'success',
                        customClass: {
                            popup: 'my-swal-style',
                        },
                    }).then(() => {
                        router.push('/logout');
                    });
                } else {
                    deletingSwal.close();
                    Swal.fire({
                        title: 'Erreur',
                        text: 'Compte introuvable.',
                        icon: 'error',
                        customClass: {
                            popup: 'my-swal-style',
                        },
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la suppression du compte :", error);
                Swal.fire({
                    title: 'Erreur',
                    text: 'Une erreur s\'est produite lors de la suppression du compte.',
                    icon: 'error',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
            }
        }
    };

    return (
        <div className="modal-manage-overlay">
            <div className="modal-manage-content">
                <div className="modal-manage-header">
                    <h2 className="modal-manage-title">Manage Account</h2>
                    <button className="close-manage-button" onClick={onClose}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-manage-body">
                    <button className="buttonManage" onClick={changeEmail}>Changer d'email</button>
                    <button className="buttonManage delete-button" onClick={deleteAccount}>Supprimer mon compte</button>
                </div>
            </div>
        </div>
    );
};

export default ManageAccount;
