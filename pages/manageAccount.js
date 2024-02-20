import React from 'react';

const ManageAccount = () => {
    return (
        <div>
            <div className="modal" id="modalAccount">
                <div className="modal-content2">
                    <div className="modal-content2-bis">
                        <p>Aide</p>
                        <p>blablabla</p>
                    </div>
                    <div className="modal-content-close">
                        <button className="buttonChat"
                                onClick={() => document.getElementById('modalAccount').style.display = "none"}>
                            X
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageAccount;
