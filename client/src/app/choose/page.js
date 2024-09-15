"use client"
import React from 'react';
import { useRouter } from 'next/navigation'; 

const Page = () => {
  const router = useRouter();
  const handleNavigation = (type) => {
    router.push(`/${type}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-16">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Choose How You Want to Continue
      </h1>
      <div className="flex flex-col items-center">
        <button
          onClick={() => handleNavigation('database')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md mb-4 hover:bg-blue-600 transition duration-300"
        >
          Database
        </button>
        <button
          onClick={() => handleNavigation('spreadsheet')}
          className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md mb-4 hover:bg-green-600 transition duration-300"
        >
          Spreadsheet
        </button>
        <button
          onClick={() => handleNavigation('csv')}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg shadow-md mb-4 hover:bg-purple-600 transition duration-300"
        >
          CSV
        </button>
      </div>
    </div>
  );
};

export default Page;
