import {useRouter} from "next/router";
import "../public/style.css"


function Index() {
    const router = useRouter();

    const handleClick = (route) => {
        router.push(route);
    };

    return (
        <div className="body2">
            <div className="welcomDiv">
                <h1 className="h1">Welcome to Sneakers World</h1>
                <button className="button" onClick={() => handleClick('/login')}>Login</button>
                <button className="button" onClick={() => handleClick('/signup')}>Signup</button>
            </div>
        </div>
    );
}

export default Index;
