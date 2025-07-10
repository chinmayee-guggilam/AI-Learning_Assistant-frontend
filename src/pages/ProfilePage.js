import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useDarkMode } from "../components/DarkModeContext";

// Register chart components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ProfilePage() {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [picPreview, setPicPreview] = useState(null);
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useDarkMode();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/user/me", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setUser(data);
    setNewUsername(data.username || "");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/user/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ username: newUsername }),
    });
    setEditMode(false);
    fetchUser();
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profilePic", file);
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/user/upload-pic", {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
    });

    const data = await res.json();
    setUser((prev) => ({ ...prev, profilePic: data.profilePic }));
  };

  const handleBackToChat = () => {
    navigate("/chat");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Chart data
  const chartData = {
    labels: user.progress?.map((p) =>
      new Date(p.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Score",
        data: user.progress?.map((p) => p.score),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow">
      {/* Profile Info */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={
              picPreview ||
              (user.profilePic
                ? `http://localhost:5000${user.profilePic}`
                : "https://api.dicebear.com/7.x/initials/svg?seed=User")
            }
            alt="Profile"
            className="w-24 h-24 rounded-full border object-cover"
          />
          <label className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full cursor-pointer">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePicUpload} />
          </label>
        </div>
        <div>
          {editMode ? (
            <>
              <input
                className="border px-2 py-1 rounded"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <button
                onClick={handleSave}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </>
          ) : (
            <h2 className="text-xl font-bold">
              {user.username || "Unnamed"}{" "}
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-500 text-sm ml-2"
              >
                Edit
              </button>
            </h2>
          )}
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      {/* Quiz Metrics */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold text-lg mb-2">Quiz Metrics</h3>
        <div className="flex justify-between text-gray-800 mb-4">
          <div>
            <p className="text-sm">Quizzes Taken</p>
            <p className="text-xl font-bold">{user.quizzesTaken || 0}</p>
          </div>
          <div>
            <p className="text-sm">Avg Score</p>
            <p className="text-xl font-bold">
              {user.quizzesTaken ? (user.totalScore / user.quizzesTaken).toFixed(1) : "0"}
            </p>
          </div>
          <div>
            <p className="text-sm">Avg %</p>
            <p className="text-xl font-bold">
              {user.quizzesTaken ? ((user.totalScore / (user.quizzesTaken * 5)) * 100).toFixed(0) + "%" : "0%"}
            </p>
          </div>
        </div>

        {/* Line Chart */}
        {user.progress?.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">📈 Progress Over Time</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No quiz data available for chart.</p>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBackToChat}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          🔙 Back to Chat
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
