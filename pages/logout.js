// pages/logout.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Logout = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Supprime le cookie nommé 'TOKEN'
        document.cookie = 'TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Attend 3 secondes avant de rediriger vers '/home'
        setTimeout(() => {
            setLoading(false);
            router.push('/');
        }, 2000); // 3000 millisecondes équivalent à 3 secondes
    }, []);

    return loading ? (
        <div>
            <p style={{textAlign:"center", color: "white", paddingTop: "25px", fontSize: "35px",fontFamily: "Calibri"}}>Please wait ...</p>
        </div>
    ) : null;
};

export default Logout;

