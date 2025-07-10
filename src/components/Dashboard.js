import React from "react";

export default function Dashboard({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-sm text-gray-500">Total Chats</h2>
        <p className="text-2xl font-semibold text-blue-600">{stats.chats}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-sm text-gray-500">Quizzes Taken</h2>
        <p className="text-2xl font-semibold text-green-600">{stats.quizzes}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-sm text-gray-500">Average Score</h2>
        <p className="text-2xl font-semibold text-yellow-600">{stats.avgScore}%</p>
      </div>
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-sm text-gray-500">Uploaded Files</h2>
        <p className="text-2xl font-semibold text-purple-600">{stats.files}</p>
      </div>
    </div>
  );
}
