import React,{useEffect} from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/UseChat";
const Dashboard = () => {
    const chat = useChat();
    const user = useSelector((state) => state.auth.user);
    console.log("User in Dashboard:", user);

    useEffect(() => {
        if (user) {
            chat.initializeSocketConnection(user.token);
        }
    }, [user]);

    return (
        <div>
            <h1>Dashboard</h1>
            {user ? (
                <p>Welcome, {user.username}!</p>
            ) : (
                <p>Please log in to see your dashboard.</p>
            )}
        </div>
    );
}
export default Dashboard;