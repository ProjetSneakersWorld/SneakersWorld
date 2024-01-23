import {useRouter} from "next/router";
import "../public/style.css"


function Index() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/home');
    };

    return (
        <div className="body">
            <div className="welcomDiv">
                <h1 className="h1">Welcome to Sneakers World</h1>
                <button className="button" onClick={handleClick}>Login</button>
            </div>
        </div>
    );
}

export default Index;
