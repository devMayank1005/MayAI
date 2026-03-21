import React from "react";
import { useSelector } from "react-redux";

const Dashboard = () => {
    const user = useSelector((state) => state.auth.user);
    console.log("User in Dashboard:", user);

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