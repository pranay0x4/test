import { useState, useEffect } from "react";

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
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Auth System</h1>

      {!token ? (
        <>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />
          <button onClick={register}>Register</button>
          <button onClick={login} style={{ marginLeft: "10px" }}>
            Login
          </button>
        </>
      ) : (
        <>
          <h2>Dashboard</h2>
          {user && (
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          )}
          <button onClick={logout}>Logout</button>
        </>
      )}

      {message && <p style={{ marginTop: "20px", color: "blue" }}>{message}</p>}
    </div>
  );
}

export default App;