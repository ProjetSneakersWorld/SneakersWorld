import React from 'react';

const ManageAdmin = ({ onClose }) => {
    return (
        <div className="modal" id="modalAdmin">
            <div className="modal-content2">
                <div className="modal-content2-bis">
                    <p>Aide</p>
                    <p>blablabla</p>
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

export default ManageAdmin;