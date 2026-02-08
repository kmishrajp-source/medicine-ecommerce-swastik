"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function AdminSetup() {
    const { data: session, status } = useSession();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePromote = async () => {
        if (!session?.user?.email) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/setup-admin?email=${session.user.email}`);
            const data = await res.json();
            if (data.success) {
                setMessage("Success! You are now an Admin. Please Log Out and Log In again.");
            } else {
                setMessage("Error: " + data.error);
            }
        } catch (error) {
            setMessage("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <h1>Admin Setup Helper</h1>

                {session ? (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '500px', margin: '30px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <p><strong>Name:</strong> {session.user.name}</p>
                        <p><strong>Email:</strong> {session.user.email}</p>
                        <p><strong>Current Role:</strong> <span style={{ fontWeight: 'bold', color: session.user.role === 'ADMIN' ? 'green' : 'red' }}>{session.user.role || 'CUSTOMER'}</span></p>

                        <div style={{ margin: '20px 0' }}>
                            {session.user.role === 'ADMIN' ? (
                                <p style={{ color: 'green' }}>✅ You are already an Admin!</p>
                            ) : (
                                <button
                                    onClick={handlePromote}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Promoting..." : "Promote Me to Admin"}
                                </button>
                            )}
                        </div>

                        {message && <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px', marginTop: '10px' }}>{message}</div>}
                    </div>
                ) : (
                    <p>Please <a href="/login" style={{ color: 'blue' }}>Login</a> first.</p>
                )}
            </div>
        </>
    );
}
