import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;
  
  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      alert("Registration successful!");
      navigate("/login");
    } else {
      alert("Registration failed. Try a different email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700">Register</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition">
          Sign Up
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
        </p>
      </form>
    </div>
  );
}
