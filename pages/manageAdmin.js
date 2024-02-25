import React, {useContext, useState} from 'react';
import {createClient} from '@supabase/supabase-js';
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
        <div>
            <button className="buttonManage" onClick={() => handleDeleteAll(currentView)}>
                Delete all
            </button>
            <table>
                <thead>
                <tr>
                    <th>Pseudo</th>
                    <th>Name</th>
                    <th>LastName</th>
                    <th>Email</th>
                    <th>Active Account</th>
                    <th>date Online</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {data.map((connexion, index) => (
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
                        <td>{connexion.dateOnline ? connexion.dateOnline : "null"}</td>
                        <td>
                            <button className="buttonManage"
                                    onClick={() => handleDelete(connexion.id, "connexion", "ce compte")}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    const ReactionTable = ({data}) => (
        <div>
            <button className="buttonManage" onClick={() => handleDeleteAll(currentView)}>
                Delete all
            </button>
            {selectAll && (
                <button
                    className="buttonManage"
                    style={{color: 'red'}}
                    onClick={() => handleDeleteAll("reaction", true)}
                >
                    Delete All {currentView}
                </button>
            )}
            <table>
                <thead>
                <tr>
                    <th>Pseudo</th>
                    <th>Emojis</th>
                    <th>Place</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {data.length === 0 && (
                    <p>Aucune Données</p>
                )}
                {data.map(Reaction => (
                    <tr key={Reaction.id}>
                        <EditableCell
                            value={Reaction.pseudo}
                            rowId={Reaction.id}
                            field="pseudo"
                            isEditing={editingCell === `${Reaction.id}-pseudo`}
                            setEditingCell={setEditingCell}
                            updateData={updateData}
                        />
                        <EditableCell
                            value={Reaction.emojis}
                            rowId={Reaction.id}
                            field="emojis"
                            isEditing={editingCell === `${Reaction.id}-emojis`}
                            setEditingCell={setEditingCell}
                            updateData={updateData}
                        />
                        <EditableCell
                            value={Reaction.place}
                            rowId={Reaction.id}
                            field="place"
                            isEditing={editingCell === `${Reaction.id}-place`}
                            setEditingCell={setEditingCell}
                            updateData={updateData}
                        />
                        <td>
                            <button className="buttonManage"
                                    onClick={() => handleDelete(Reaction.id, "reaction", "cette reaction")}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    const MessageTable = ({data}) => (
        <div>
            <button className="buttonManage" onClick={() => handleDeleteAll(currentView)}>
                Delete all
            </button>
            {selectAll && (
                <button
                    className="buttonManage"
                    style={{color: 'red'}}
                    onClick={() => handleDeleteAll("message", true)}
                >
                    Delete All {currentView}
                </button>
            )}
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>Message</th>
                        <th>Timestamp</th>
                        <th>Place</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length === 0 && (
                        <div style={{}}>
                            <p>Aucune Données</p>
                        </div>
                    )}
                    {data.map((Message) => (
                        <tr key={Message.id}>
                            <EditableCell
                                value={Message.message}
                                rowId={Message.id}
                                field="message"
                                isEditing={editingCell === `${Message.id}-message`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <EditableCell
                                value={Message.timestamp}
                                rowId={Message.id}
                                field="timestamp"
                                isEditing={editingCell === `${Message.id}-timestamp`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <EditableCell
                                value={Message.place}
                                rowId={Message.id}
                                field="place"
                                isEditing={editingCell === `${Message.id}-place`}
                                setEditingCell={setEditingCell}
                                updateData={updateData}
                            />
                            <td>
                                <button
                                    className="buttonManage"
                                    onClick={() => handleDelete(Message.id, "message", "ce message")}
                                >
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

    const handleDelete = async (id, table, itemType) => {
        if (window.confirm(`Êtes-vous sûr de vouloir Delete ${itemType} ?`)) {
            setLoading(true);
            const {error} = await supabase.from(table).delete().eq('id', id);
            setLoading(false);

            if (error) {
                console.error('Error deleting:', error);
                alert('An error occurred while deleting the item.');
            } else {
                setData(prevData => prevData.filter(item => item.id !== id));
            }
        }
    };

    const handleDeleteAll = async (tableName) => {
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir Delete tous les éléments de la table ${tableName} ?`
        );
        if (confirmed) {
            try {
                // Affichez une alerte non fermable pendant la suppression
                const deletingSwal = Swal.fire({
                    title: `Suppression des éléments de la table ${tableName}`,
                    text: 'Veuillez patienter...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    customClass: {
                        popup: 'my-swal-style', // Appliquez la classe CSS personnalisée
                    },
                });

                const {data, error} = await supabase.from('message').select();

                if (error) {
                    console.error('Erreur lors de la récupération des données :', error);
                } else {
                    for (const row of data) {
                        await supabase.from('message').delete().eq('id', row.id);
                    }
                }

                if (error) {
                    throw error;
                }
                setData([]);

                // Fermez l'alerte de suppression et affichez une alerte de succès
                deletingSwal.close();
                await Swal.fire({
                    text: `Tous les éléments de la table ${tableName} ont été supprimés avec succès.`,
                    customClass: {
                        popup: 'my-swal-style', // Appliquez la classe CSS personnalisée
                    },
                });
            } catch (err) {
                console.error("Error deleting all items:", err);
                alert("Une erreur s'est produite lors de la suppression des éléments.");
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
        <div className="modal" id="modalAdmin">
            <div className="modal-content-manage">
                <div>
                    {loading ? (
                        <div style={{
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: "140px",
                            fontSize: "25px"
                        }}>
                            <p>Loading ...</p>
                            <Rolling/>
                        </div>
                    ) : currentView === 'menu' ? (
                        <div style={{display: "flex", flexDirection: "column", padding: "50px 150px", gap: "19px"}}>
                            <h1 style={{textAlign: "center"}}>Table</h1>
                            <button className="buttonManage" style={{height: "3.5rem", padding: "12px 36px"}} onClick={() => fetchData('connexion')}>Connexion</button>
                            <button className="buttonManage" style={{height: "3.5rem", padding: "12px 36px"}} onClick={() => fetchData('message')}>Message</button>
                            <button className="buttonManage" style={{height: "3.5rem", padding: "12px 36px"}} onClick={() => fetchData('reaction')}>Réaction</button>
                        </div>
                    ) : (
                        <div>
                            <h1 style={{textAlign: "center"}}>{currentView}</h1>
                            <button className="buttonManage" style={{background: "green"}}
                                    onClick={() => setCurrentView('menu')}>Back
                            </button>
                            {renderTable()}
                        </div>
                    )}
                    <div className="modal-content-close">
                        <button className="buttonManageClose" onClick={() => {
                            onClose();
                            setUpdateChat(prev => !prev);
                        }} aria-label="Close">
                            X
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAdmin;