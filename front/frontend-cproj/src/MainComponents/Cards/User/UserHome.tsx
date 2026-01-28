import React, { useEffect, useState } from "react";

export default function UserHome() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("token"); 
            try {
                const resp = await fetch("http://localhost:8000/users/userhome", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` 
                    }
                });

                if (resp.ok) {
                    const data = await resp.json();
                    setUser(data);  
                }
            } catch (error) {
                console.error("Failed to fetch dashboard:", error);
            }
        };

        fetchDashboardData();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="wmsg">
            {/* Note: The backend structure you wrote returns 'user' and 'stats' as separate keys */}
            <h1>Welcome back, {user.user?.name || "User"}</h1>
            <h2>Here are the stats: {user.stats?.completedQuestions ?? 0}</h2>
        </div>
    );
}