import React, { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    chats: 0,
    quizzes: 0,
    avgScore: 0,
    files: 0,
  });

  useEffect(() => {
    // Simulated stats (replace with backend call if needed)
    setStats({
      chats: 15,
      quizzes: 4,
      avgScore: 78,
      files: 6,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">📊 Progress Dashboard</h1>
      <Dashboard stats={stats} />
    </div>
  );
}
