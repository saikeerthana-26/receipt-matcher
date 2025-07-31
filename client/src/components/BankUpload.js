import React, { useState, useEffect } from 'react';

const BankUpload = () => {
  const [file, setFile] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    const refreshCompare = async () => {
      try {
        const res = await fetch(`${backendUrl}/compare`);
        const data = await res.json();
        setComparisonResult(data);
      } catch (err) {
        console.error("Failed to refresh comparison:", err);
      }
    };

    window.addEventListener('refreshCompare', refreshCompare);
    return () => {
      window.removeEventListener('refreshCompare', refreshCompare);
    };
  }, [backendUrl]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${backendUrl}/upload-bank`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await res.json();
      if (!uploadData.success) {
        alert("Upload failed.");
        return;
      }

      const compareRes = await fetch(`${backendUrl}/compare`);
      const comparisonData = await compareRes.json();
      setComparisonResult(comparisonData);
    } catch (err) {
      console.error("Upload or comparison failed", err);
      alert("Failed to upload or compare transactions.");
    }
  };

  const renderTable = (data, title, bgColor) => (
    <div className="mt-6">
      <h3 className={`font-bold text-lg mb-2 ${bgColor}`}>{title}</h3>
      <div className="overflow-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-gray-300 p-2">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">{entry.description}</td>
                <td className="border border-gray-300 p-2">
                  ${Number(entry.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMatchedTable = (matchedData) => (
    <div className="mt-6">
      <h3 className="font-bold text-lg mb-2 text-green-700">✅ Matched Transactions</h3>
      <div className="overflow-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {matchedData.map((match, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-gray-300 p-2">
                  {new Date(match.ledger.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">{match.ledger.description}</td>
                <td className="border border-gray-300 p-2">
                  ${Number(match.ledger.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold mb-4">📤 Upload Bank Statement CSV</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Compare Transactions
      </button>

      {comparisonResult && (
        <>
          {renderMatchedTable(comparisonResult.matched)}
          {renderTable(comparisonResult.onlyInLedger, "📒 Only in Ledger", "text-yellow-700")}
          {renderTable(comparisonResult.onlyInBank, "🏦 Only in Bank Statement", "text-red-700")}
        </>
      )}
    </div>
  );
};

export default BankUpload;
