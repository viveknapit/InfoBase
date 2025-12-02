import { useState } from "react";
import { loginService } from "../services/UserServices";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { SetLoginDetails } from "../redux/slices/UserSlice";
import { useNavigate } from "react-router-dom";
//import { useLocation } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    //const location = useLocation() as any;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const validate = () => {
        if (!username.trim()) return "Email or username is required";
        if (!password) return "Password is required";
        if (username.includes("@") && !/^\S+@\S+\.\S+$/.test(username)) return "Enter a valid email";
        return null;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        setError(null);
        const v = validate();
        if (v) {
        setError(v);
        setLoading(false);
        return;
        }

        try{
            const resp = await loginService({username, password});
            dispatch(SetLoginDetails(resp.user));
            navigate('/', {replace: true});
        }catch(err : any){
            setError(err.response?.data?.message || "Invalid login credentials");
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Sign in</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email or username</label>
                    <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="you@example.com"
                    autoComplete="username"
                    disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    />
                </div>
                <div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
                    >
                    {loading ? "Signing in..." : "Sign in"}
                    </button>
                </div>
        </form>
      </div>
    </div>
    )
}