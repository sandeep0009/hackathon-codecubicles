"use client";

import React, { useState } from 'react';
import axios from 'axios';

const Page = () => {
  const [formData, setFormData] = useState({
    dbType: "",
    host: "",
    port: "",
    user: "",
    password: "",
    database: "",
    table_name: ""
  });

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const fetchData = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('http://127.0.0.1:5000/database', formData);
      setInsights(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg shadow-md h-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-200">Database Connection Form</h2>
      <form onSubmit={fetchData}>
        <div className="mb-3">
          <label htmlFor="dbType" className="block text-gray-200">Database Type</label>
          <input
            type="text"
            id="dbType"
            name="dbType"
            value={formData.dbType}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="host" className="block text-gray-200">Host</label>
          <input
            type="text"
            id="host"
            name="host"
            value={formData.host}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="port" className="block text-gray-200">Port</label>
          <input
            type="text"
            id="port"
            name="port"
            value={formData.port}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="user" className="block text-gray-200">Username</label>
          <input
            type="text"
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="block text-gray-200">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="database" className="block text-gray-200">Database Name</label>
          <input
            type="text"
            id="database"
            name="database"
            value={formData.database}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="table_name" className="block text-gray-200">Table Name</label>
          <input
            type="text"
            id="table_name"
            name="table_name"
            value={formData.table_name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg py-2 px-3 bg-[#181C14] text-gray-200 focus:outline-none"
          />
        </div>

        <div className="flex justify-start mt-4">
          <button
            type="submit"
            className="border border-green-500 text-green-500 py-2 px-4 rounded-lg shadow-md hover:bg-green-500 hover:text-white transition duration-300"
          >
            Submit
          </button>
        </div>
      </form>

      {loading && <p className="text-gray-200 mt-4">Loading...</p>}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {insights && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-200">Summary</h2>
          <p>{insights.summary}</p>

          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-200">Named Entities</h2>
          <ul>
            {insights.entities.map((entity, index) => (
              <li key={index}>
                <strong>{entity[1]}:</strong> {entity[0]}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-200">Plot</h2>
          <img src={`data:image/png;base64,${insights.plot}`} alt="Data Distribution Plot" />
        </div>
      )}
    </div>
  );
};

export default Page;
