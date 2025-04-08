import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

const ViewPensionDetails = () => {
  const [details, setDetails] = useState(null);
  const [month, setMonth] = useState("2025-03");
  const componentRef = useRef();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/user-pension",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        // You can format or calculate values here if needed
        setDetails({
          ppono: data.PPoNo,
          name: data.name,
          employmentType: data.employmentType || "TEACHING",
          month,
          basicPay: data.basic || 0,
          da: data.dr || 0,
          hra: data.medi_allowance || 0,
          deductions: (data.other_deduction || 0) + (data.income_tax || 0),
          netPay: data.net_pay || 0,
        });
      } catch (error) {
        console.error("Error fetching pension details:", error);
      }
    };

    fetchDetails();
  }, [month]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Pension-Details-${details?.ppono}-${month}`,
  });

  if (!details) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">Pension Details</h2>

      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="mr-2 font-semibold">Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Print / Export PDF
        </button>
      </div>

      <div ref={componentRef}>
        <div>
          <p>
            <strong>Name:</strong> {details.name}
          </p>
          <p>
            <strong>PPONO:</strong> {details.ppono}
          </p>
          <p>
            <strong>Employment Type:</strong> {details.employmentType}
          </p>
        </div>

        <table className="w-full text-left border mt-4">
          <thead>
            <tr>
              <th className="border px-2 py-1">Component</th>
              <th className="border px-2 py-1">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">Basic Pay</td>
              <td className="border px-2 py-1">{details.basicPay}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">DA</td>
              <td className="border px-2 py-1">{details.da}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Medical Allowance</td>
              <td className="border px-2 py-1">{details.hra}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-red-600">Deductions</td>
              <td className="border px-2 py-1 text-red-600">
                - {details.deductions}
              </td>
            </tr>
            <tr className="font-bold">
              <td className="border px-2 py-1">Net Pay</td>
              <td className="border px-2 py-1">{details.netPay}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewPensionDetails;
