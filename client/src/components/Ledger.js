import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaFileAlt, FaEnvelope, FaTrash } from 'react-icons/fa';

const BACKEND_URL='https://receipt-matcher-backend.onrender.com';


const Ledger = () => {
    const [entries, setEntries] = useState([]);

    const fetchLedger = () => {
        fetch(`${BACKEND_URL}/ledger`)
            .then(res => res.json())
            .then(data => setEntries(data))
            .catch(err => console.error("Failed to fetch ledger:", err));
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    const handleDelete = async (id) => {
        const confirm = window.confirm("Are you sure you want to delete this entry?");
        if (!confirm) return;
    
        try {
            await fetch(`${BACKEND_URL}/ledger/${id}`, { method: 'DELETE' });
            setEntries(prev => prev.filter(entry => entry.id !== id));
    
            // 🚀 Dispatch custom event to trigger compare refresh
            window.dispatchEvent(new Event('refreshCompare'));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete entry.");
        }
    };
    
    return (
        <div className="max-w-5xl mx-auto p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl shadow-md mt-10">
            <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6 flex items-center justify-center gap-2">
                <FaFileAlt /> Ledger Entries
            </h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="text-center py-3 px-4"><FaCalendarAlt className="inline-block mr-1" /> Date</th>
                            <th className="text-center py-3 px-4"><FaFileAlt className="inline-block mr-1" /> Description</th>
                            <th className="text-center py-3 px-4"><FaMoneyBillWave className="inline-block mr-1" /> Amount</th>
                            <th className="text-center py-3 px-4"><FaEnvelope className="inline-block mr-1" /> Source</th>
                            <th className="text-center py-3 px-4">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={entry.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="py-2 px-4 text-center text-gray-700">
                                    {new Date(entry.date).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4 text-center text-gray-700">
                                    {entry.description}
                                </td>
                                <td className="py-2 px-4 text-center text-green-700 font-semibold">
                                    ${entry.amount.toFixed(2)}
                                </td>
                                <td className="py-2 px-4 text-center text-blue-600">
                                    {entry.source}
                                </td>
                                <td className="py-2 px-4 text-center text-red-600">
                                    <button onClick={() => handleDelete(entry.id)} className="hover:text-red-800">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    No ledger entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default Ledger;
