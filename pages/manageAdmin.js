import React, {useContext, useState} from 'react';
import '/public/manage.css';
import {GameContext} from "../src/GameContext";
import Swal from 'sweetalert2';
import { supabase } from './api/supabaseClient'

const ManageAdmin = ({onClose}) => {
    const [currentView, setCurrentView] = useState('menu');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const {setUpdateChat} = useContext(GameContext);

    // Define a table component for each table type
    const ConnexionTable = ({data}) => (
        <div className="table-container">
            <div className="table-header">
                <button className="buttonManage delete-button" onClick={() => handleDeleteAll(currentView)}>
                    Delete all
                </button>
            </div>
            <div className="table-wrapper">
                <table className="manage-table">
                    <thead>
                    <tr>
                        <th>Pseudo</th>
                        <th>Name</th>
                        <th>LastName</th>
                        <th>Email</th>
                        <th>Active Account</th>
                        <th>Date Online</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((connexion) => (
                        <tr key={connexion.id}>
                            <EditableCell
                                value={connexion.pseudo}
                                rowId={connexion.id}
                                field="pseudo"
                                isEditing={editingCell === `${connexion.id}-pseudo`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <EditableCell
                                value={connexion.name}
                                rowId={connexion.id}
                                field="name"
                                isEditing={editingCell === `${connexion.id}-name`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <EditableCell
                                value={connexion.lastName}
                                rowId={connexion.id}
                                field="lastName"
                                isEditing={editingCell === `${connexion.id}-lastName`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <EditableCell
                                value={connexion.email}
                                rowId={connexion.id}
                                field="email"
                                isEditing={editingCell === `${connexion.id}-email`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <td>{connexion.isActive ? "Actif" : "Inactif"}</td>
                            <td>{connexion.dateOnline || "null"}</td>
                            <td>
                                <button className="buttonManage delete-button"
                                        onClick={() => handleDelete(connexion.id, "connexion", "ce compte")}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ReactionTable = ({data}) => (
        <div className="table-container">
            <div className="table-header">
                <button className="buttonManage delete-button" onClick={() => handleDeleteAll(currentView)}>
                    Delete all
                </button>
                {selectAll && (
                    <button
                        className="buttonManage delete-button"
                        onClick={() => handleDeleteAll("reaction", true)}
                    >
                        Delete All {currentView}
                    </button>
                )}
            </div>
            <div className="table-wrapper">
                <table className="manage-table">
                    <thead>
                    <tr>
                        <th>Pseudo</th>
                        <th>Emojis</th>
                        <th>Place</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan="4">Aucune Données</td></tr>
                    ) : (
                        data.map(reaction => (
                            <tr key={reaction.id}>
                                <EditableCell
                                    value={reaction.pseudo}
                                    rowId={reaction.id}
                                    field="pseudo"
                                    isEditing={editingCell === `${reaction.id}-pseudo`}
                                    setEditingCell={setEditingCell}
                                    updateData={updateData}
                                />
                                <EditableCell
                                    value={reaction.emojis}
                                    rowId={reaction.id}
                                    field="emojis"
                                    isEditing={editingCell === `${reaction.id}-emojis`}
                                    setEditingCell={setEditingCell}
                                    updateData={updateData}
                                />
                                <EditableCell
                                    value={reaction.place}
                                    rowId={reaction.id}
                                    field="place"
                                    isEditing={editingCell === `${reaction.id}-place`}
                                    setEditingCell={setEditingCell}
                                    updateData={updateData}
                                />
                                <td>
                                    <button className="buttonManage delete-button"
                                            onClick={() => handleDelete(reaction.id, "reaction", "cette reaction")}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const MessageTable = ({data}) => (
        <div className="table-container">
            <div className="table-header">
                <button className="buttonManage delete-button" onClick={() => handleDeleteAll(currentView)}>
                    Delete all
                </button>
                {selectAll && (
                    <button
                        className="buttonManage delete-button"
                        onClick={() => handleDeleteAll("message", true)}
                    >
                        Delete All {currentView}
                    </button>
                )}
            </div>
            <div className="table-wrapper">
                <table className="manage-table">
                    <thead>
                    <tr>
                        <th>Message</th>
                        <th>Timestamp</th>
                        <th>Place</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan="4">Aucune Données</td></tr>
                    ) : (
                        data.map((message) => (
                            <tr key={message.id}>
                                <EditableCell
                                    value={message.message}
                                    rowId={message.id}
                                    field="message"
                                    isEditing={editingCell === `${message.id}-message`}
                                    setEditingCell={setEditingCell}
                                    updateData={updateData}
                                />
                                <EditableCell
                                    value={message.timestamp}
                                    rowId={message.id}
                                    field="timestamp"
                                    isEditing={editingCell === `${message.id}-timestamp`}
                                    setEditingCell={setEditingCell}
                                    updateData={updateData}
                                />
                                <EditableCell
                                    value={message.place}
                                    rowId={message.id}
                                    field="place"
                                    isEditing={editingCell === `${message.id}-place`}
                                    setEditingCell={setEditingCell}
                                    updateData={updateData}
                                />
                                <td>
                                    <button
                                        className="buttonManage delete-button"
                                        onClick={() => handleDelete(message.id, "message", "ce message")}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleDelete = async (id, table, itemType) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Confirmation de suppression',
            text: `Êtes-vous sûr de vouloir supprimer cet ${itemType} ?`,
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
                const deletingSwal = Swal.fire({
                    title: `Suppression de ${itemType}`,
                    text: 'Veuillez patienter...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });

                const { error } = await supabase.from(table).delete().eq('id', id);

                if (error) {
                    throw error;
                }

                setData(prevData => prevData.filter(item => item.id !== id));

                deletingSwal.close();
                await Swal.fire({
                    title: 'Succès',
                    text: `${itemType} a été supprimé avec succès.`,
                    icon: 'success',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
            } catch (error) {
                console.error("Erreur lors de la suppression de l'élément :", error);
                await Swal.fire({
                    title: 'Erreur',
                    text: "Une erreur s'est produite lors de la suppression de l'élément.",
                    icon: 'error',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
            }
        }
    };


    const handleDeleteAll = async (tableName) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Confirmation de suppression',
            text: `Êtes-vous sûr de vouloir supprimer tous les éléments de la table ${tableName} ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer tout',
            cancelButtonText: 'Annuler',
            customClass: {
                popup: 'my-swal-style',
            },
        });

        if (isConfirmed) {
            try {
                const deletingSwal = Swal.fire({
                    title: `Suppression des éléments de la table ${tableName}`,
                    text: 'Veuillez patienter...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });

                const { data, error } = await supabase.from(tableName).select();

                if (error) {
                    throw error;
                }

                for (const row of data) {
                    await supabase.from(tableName).delete().eq('id', row.id);
                }

                setData([]);

                deletingSwal.close();
                await Swal.fire({
                    title: 'Succès',
                    text: `Tous les éléments de la table ${tableName} ont été supprimés avec succès.`,
                    icon: 'success',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
            } catch (error) {
                console.error("Erreur lors de la suppression de tous les éléments :", error);
                await Swal.fire({
                    title: 'Erreur',
                    text: "Une erreur s'est produite lors de la suppression des éléments.",
                    icon: 'error',
                    customClass: {
                        popup: 'my-swal-style',
                    },
                });
            }
        }
    };

    const fetchData = async (tableName) => {
        setLoading(true);
        const {data, error} = await supabase.from(tableName).select('*');
        setLoading(false);
        if (error) {
            console.error(error);
        } else {
            setData(data);
            setCurrentView(tableName);
        }
    };

    const renderTable = () => {
        switch (currentView) {
            case 'connexion':
                return <ConnexionTable data={data}/>;
            case 'reaction':
                return <ReactionTable data={data}/>;
            case 'message':
                return <MessageTable data={data}/>;
            default:
                return null;
        }
    };

    const EditableCell = ({value, rowId, field, isEditing, setEditingCell, updateData}) => {
        const [inputValue, setInputValue] = useState(value);

        const handleFocus = () => {
            setEditingCell(`${rowId}-${field}`);
        };

        const handleBlur = () => {
            setEditingCell(null);
            if (inputValue.trim() !== '' && inputValue !== value) {
                updateData(rowId, field, inputValue);
            } else {
                setInputValue(value); // Reset to original value if empty
            }
        };

        return isEditing ? (
            <td>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    className="inputsManage"
                    autoFocus
                    onKeyDown={(event) => {
                        event.stopPropagation();
                    }}
                />
            </td>
        ) : (
            <td onClick={handleFocus}>{value}</td>
        );
    };

    const updateData = async (rowId, field, newValue) => {
        setLoading(true);
        const {data, error} = await supabase
            .from(currentView)
            .update({[field]: newValue})
            .eq('id', rowId);
        setLoading(false);
        if (error) {
            console.error('Error updating:', error);
        } else {
            // Mettre à jour l'état local de `data`
            setData((prevData) =>
                prevData.map((item) => (item.id === rowId ? {...item, [field]: newValue} : item))
            );
        }
    };

    const Rolling = () => (<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{
            margin: "0", display: "block", shapeRendering: "auto",
        }}
        width="60"
        height="60"
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
                animation: "rotate 1s infinite", transformOrigin: "50% 50%", strokeLinecap: "round",
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
    </svg>);

    return (
        <div className="modal-manage-overlay" id="modalAdmin">
            <div className={`modal-manage-content ${currentView !== 'menu' ? 'table-view' : ''}`}>
                <div className="modal-manage-header">
                    <h2 className="modal-manage-title">
                        {currentView === 'menu' ? 'Table' : currentView}
                    </h2>
                    <button className="close-manage-button" onClick={() => {
                        onClose();
                        setUpdateChat(prev => !prev);
                    }} aria-label="Close">
                        &times;
                    </button>
                </div>
                <div className="modal-manage-body">
                    {loading ? (
                        <div className="loading-container">
                            <p style={{fontSize: "22px"}}>Loading ...</p>
                            <Rolling/>
                        </div>
                    ) : currentView === 'menu' ? (
                        <div className="menu-buttons" style={{gap : "2rem"}}>
                            <button className="buttonManage" onClick={() => fetchData('connexion')}>Connexion</button>
                            <button className="buttonManage" onClick={() => fetchData('message')}>Message</button>
                            <button className="buttonManage" onClick={() => fetchData('reaction')}>Réaction</button>
                        </div>
                    ) : (
                        <div className="table-view">
                            <button className="buttonManage back-button" onClick={() => setCurrentView('menu')}>Back</button>
                            {renderTable()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAdmin;
