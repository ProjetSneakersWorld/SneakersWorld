import React, {useEffect, useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import '/public/manage.css';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ManageAdmin = ({onClose}) => {
    const [currentView, setCurrentView] = useState('menu');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCell, setEditingCell] = useState(null);

    useEffect(() => {
        // document.getElementById("ContainerPrincipale").remove();
    }, [])
    // Define a table component for each table type
    const ConnexionTable = ({data}) => (
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
                            Supprimer
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const ReactionTable = ({data}) => (
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
                    /><EditableCell
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
                            Supprimer
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const MessageTable = ({data}) => (
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
            {data.map(Message => (
                <tr key={Message.id}>
                    <td>{Message.message}</td>
                    <td>{Message.timestamp}</td>
                    <td>{Message.place}</td>
                    <td>
                        <button className="buttonManage"
                                onClick={() => handleDelete(Message.id, "message", "ce message")}>
                            Supprimer
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const handleDelete = async (id, table, itemType) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${itemType} ?`)) {
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
        width="50"
        height="50"
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
                {loading ? (
                    <div style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "200px",
                        fontSize: "25px"
                    }}>
                        <p>Loading ...</p>
                        <Rolling/>
                    </div>
                ) : currentView === 'menu' ? (
                    <div style={{display: "flex", flexDirection: "column", padding: "50px 150px", gap: "19px"}}>
                        <h1>Table</h1>
                        <button className="buttonManage" onClick={() => fetchData('connexion')}>Connexion</button>
                        <button className="buttonManage" onClick={() => fetchData('reaction')}>Réaction</button>
                        <button className="buttonManage" onClick={() => fetchData('message')}>Message</button>
                    </div>
                ) : (
                    <div>
                        <button className="buttonManage" style={{background: "green"}}
                                onClick={() => setCurrentView('menu')}>Back
                        </button>
                        {renderTable()}
                    </div>
                )}
                <div className="modal-content-close">
                    <button className="buttonManageClose" onClick={onClose} aria-label="Close">
                        X
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageAdmin;