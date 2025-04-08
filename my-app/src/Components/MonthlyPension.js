import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import "./MonthlyPension.css";

const MonthlyPension = () => {
  const [month, setMonth] = useState("2025-03");
  const [empType, setEmpType] = useState("TEACHING");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/pensions/all?month=${month}&employmentType=${empType}`
      );
      setData(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Initial fetch

  const handleSearch = () => {
    fetchData(); // Fetch when Search button is clicked
  };

  return (
    <div className="pension-container">
      <h1>Monthly Pension Processing</h1>

      <div className="filter-controls">
        <div className="filter-group">
          <label>Month and Year</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Employee Type</label>
          <select value={empType} onChange={(e) => setEmpType(e.target.value)}>
            <option value="TEACHING">TEACHING</option>
            <option value="NON-TEACHING">NON-TEACHING</option>
          </select>
        </div>

        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading pension records...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <table className="pension-table">
        <thead>
          <tr>
            <th>SLNO</th>
            <th>PPONO</th>
            <th>NAME</th>
            <th>NET PAY</th>
            <th>Edit/Add</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((p, index) => (
              <tr key={p._id || p.ppono}>
                <td>{index + 1}</td>
                <td>
                  <Link
                    to={`/pension-details/${p.ppono}/${month}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {p.ppono}
                  </Link>
                </td>
                <td>{p.name}</td>
                <td>{p.netPay}</td>
                <td className="action-icons">
                  <FaEdit />
                  <FaPlus />
                  <FaTrash className="delete-icon" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyPension;
