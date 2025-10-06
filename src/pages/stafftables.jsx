import { useState, useEffect } from "react";

export default function Tables() {
  const [selectedTable, setSelectedTable] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

  // Include transactions, but read-only (except delete)
  const tables = ["products", "transactions"];

  // Fetch rows
  const fetchData = () => {
    if (selectedTable) {
      setLoading(true);
      fetch(`http://localhost:3000/${selectedTable}`)
        .then((res) => res.json())
        .then((rows) => {
          setData(rows);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable]);

  // Open form for Add / Update (not for transactions)
  const openForm = (mode, row = {}) => {
    setFormMode(mode);
    setFormData(row);
    setEditId(mode === "update" ? row[Object.keys(row)[0]] : null);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form (only for non-transaction tables)
  const handleSubmit = async () => {
    try {
      if (formMode === "add") {
        await fetch(`http://localhost:3000/${selectedTable}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`http://localhost:3000/${selectedTable}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setFormData({});
      fetchData();
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  // Delete record (works for all tables, including transactions)
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/${selectedTable}/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white px-6 py-12">
      <h2 className="text-4xl font-extrabold text-center mb-10">
        <span className="text-[hsl(200,100%,70%)]">Welcome back</span> Admin
      </h2>

      {/* Dropdown Selector */}
      <div className="flex justify-center mb-8">
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="px-6 py-3 rounded-xl text-black font-semibold shadow-md focus:ring-2 focus:ring-[hsl(200,100%,70%)]"
        >
          <option value="">-- Select a Table --</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>

        <div className="flex justify-end max-w-6xl mx-auto mb-4">
          <button
            onClick={() => openForm("add")}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition"
          >
            ➕ Add Record
          </button>
        </div>
      

      {/* Table Display */}
      {loading ? (
        <p className="text-center text-gray-400">Loading {selectedTable}...</p>
      ) : selectedTable && data.length > 0 ? (
        <div className="overflow-x-auto max-w-6xl mx-auto shadow-xl rounded-2xl bg-[#1e293b] border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#334155] text-[hsl(200,100%,70%)]">
                {Object.keys(data[0]).map((col) => (
                  <th key={col} className="p-4 capitalize">
                    {col}
                  </th>
                ))}
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-700 hover:bg-[#2d3b52] transition-colors"
                >
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-4">
                      {val !== null ? val.toString() : "—"}
                    </td>
                  ))}
                  <td className="p-4 space-x-2">
                    {/* Hide Update for transactions */}
                    {selectedTable !== "transactions" && (
                      <button
                        onClick={() => openForm("update", row)}
                        className="px-3 py-1 bg-yellow-500 text-black rounded-lg hover:scale-105 transition"
                      >
                        Update
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(row[Object.keys(row)[0]])}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:scale-105 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedTable ? (
        <p className="text-center text-gray-400">No records found.</p>
      ) : (
        <p className="text-center text-gray-400">Select a table to view data.</p>
      )}

      {/* Form Modal (not for transactions) */}
      {showForm && selectedTable !== "transactions" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 capitalize">
              {formMode} {selectedTable} record
            </h3>

            {Object.keys(data[0] || {}).map((col) =>
              col.includes("id") || col.includes("created_at") ? null : (
                <div key={col} className="mb-3">
                  <label className="block text-sm mb-1 capitalize">{col}</label>
                  <input
                    type="text"
                    name={col}
                    value={formData[col] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-black"
                  />
                </div>
              )
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[hsl(200,100%,70%)] rounded-lg font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
