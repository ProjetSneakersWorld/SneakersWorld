import React, {useEffect, useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import '/public/manage.css';

// Assurez-vous d'avoir importé vos variables d'environnement correctement
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ManageAccount = ({onClose}) => {
    const [connexions, setConnexions] = useState([]);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const {data, error} = await supabase
                .from('connexion')
                .select('*');

            if (error) {
                console.error(error);
            } else {
                setConnexions(data);
                setLoad(true);
            }
        };

        fetchData();
    }, []);

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
                {load ? (
                    <div>
                        <p>Rien</p>
                    </div>
                ) : (
                    <div className="modal-content-manage">
                        <div style={{
                            textAlign: "center",
                            fontFamily: "Arial",
                            fontSize: "22px",
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column"
                        }}>
                            <p>Loading ...</p>
                            <Rolling/>
                        </div>
                    </div>
                )}
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