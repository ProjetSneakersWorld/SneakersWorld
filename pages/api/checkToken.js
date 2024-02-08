// pages/api/checkToken.js
import jwt from "jsonwebtoken";
const secretKey = "secret_key";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const token = req.body.token || "";
            jwt.verify(token, secretKey);
            return res.status(200).json({ valid: true });
        } catch (error) {
            console.log("Error during token verification");
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
