import "./App.css";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:3000"; // change after deployment

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  type User = {
    id: string;
    email: string;
  };
  
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  async function register() {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setMessage(data.message || JSON.stringify(data));
  }

  async function login() {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setMessage("Login successful");
    } else {
      setMessage(data.message || "Login failed");
    }
  }

  async function fetchDashboard() {
    const res = await fetch(`${API}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
    } else {
      setMessage(data.message);
      logout();
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setMessage("Logged out");
  }

  return (
    <div className="app">
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
  
      <AnimatePresence mode="wait">
        {!token ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <h1 className="title">Auth System</h1>
  
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
  
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
  
            <div className="button-group">
              <button className="btn secondary" onClick={register}>
                Register
              </button>
              <button className="btn primary" onClick={login}>
                Login
              </button>
            </div>
  
            {message && <p className="message">{message}</p>}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="card"
          >
            <h2 className="dashboard-title">Welcome Back</h2>
  
            {user && (
              <div className="user-box">
                <p>{user.email}</p>
              </div>
            )}
  
            <button className="btn danger full" onClick={logout}>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;