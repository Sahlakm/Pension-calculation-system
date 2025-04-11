import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const formatDate = (dateStr) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ViewPensionDetails = ({ user }) => {
  const [data, setData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [email, setEmail] = useState(null);
  const [totals, setTotals] = useState(null);
  // console.log("User Email:", email);

  useEffect(() => {
    if (!user?.email) return;

    fetch(`/snapshot/daily_snapshot/${user.email}`)
      .then((res) => res.json())
      .then((fetchedData) => {
        setRawData(fetchedData);
        console.log("Fetched pension data:", fetchedData);
        // const payments = fetchedData || [];
        const calculatedTotals = fetchedData.reduce(
          (totals, item) => {
            totals.total_pension += item.total_pension;
            totals.income_tax += item.income_tax;
            totals.net_pay += item.net_pay;
            return totals;
          },
          { total_pension: 0, income_tax: 0, net_pay: 0 }
        );
        console.log(calculatedTotals);

        setTotals(calculatedTotals);

        // setData({ ...fetchedData, payments, totals: calculatedTotals });
        // console.log({ ...fetchedData, payments, totals: calculatedTotals });
      })
      .catch((err) => console.error("Failed to fetch data:", err));
  }, [user]);

  const downloadPdf = () => {
    if (!rawData) {
      alert("No Data");
      return;
    }
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("NATIONAL INSTITUTE OF TECHNOLOGY CALICUT", 50, 15);
    doc.setFontSize(12);
    doc.text(
      "CONSOLIDATED REPORT OF PENSION PAYMENT",
      57,
      25
    );

    doc.text(`NAME: ${rawData[0].name}`, 20, 35);
    doc.text(`PPONO: ${rawData[0].PPoNo}`, 20, 42);

    console.log(totals);

    autoTable(doc, {
      startY: 50,
      head: [["Sl.No", "Date", "Pension Paid", "Income Tax", "Total Pension"]],
      body: [
        ...rawData.map((item, index) => [
          index + 1,
          format_date(item.snapshot),
          item.total_pension.toLocaleString(),
          item.income_tax.toLocaleString(),
          item.net_pay.toLocaleString(),
        ]),
        [
          { content: "Grand Total", colSpan: 2 },
          totals.total_pension.toLocaleString(),
          totals.income_tax.toLocaleString(),
          totals.net_pay.toLocaleString(),
        ],
      ],
    });

    doc.text(
      `Date of Birth: ${formatDate(rawData[0].date_of_birth)}`,
      20,
      doc.lastAutoTable.finalY + 10
    );
    doc.text(
      `Date of Retire: ${formatDate(rawData[0].date_of_retirement)}`,
      20,
      doc.lastAutoTable.finalY + 17
    );

    doc.save("Pension_Report.pdf");
  };

  const downloadXlsx = () => {
    if (!rawData) {
      alert("No Data");
      return;
    }
    const wsData = [
      ["NATIONAL INSTITUTE OF TECHNOLOGY CALICUT"],
      ["CONSOLIDATED REPORT OF PENSION PAYMENT"],
      ["NAME:", rawData[0].name],
      ["PPONO:", rawData[0].PPoNo],
      [],
      ["Sl.No", "Date", "Pension Paid", "Income Tax", "Total Pension"],
      ...rawData.map((item, index) => [
        index + 1,
        format_date(item.snapshot),
        item.total_pension,
        item.income_tax,
        item.net_pay,
      ]),
      [
        "Grand Total",
        "",
        totals.total_pension,
        totals.income_tax,
        totals.net_pay,
      ],
      [],
      ["Date of Birth:", formatDate(rawData[0].date_of_birth.split("T")[0])],
      [
        "Date of Retire:",
        formatDate(rawData[0].date_of_retirement.split("T")[0]),
      ],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "PensionReport");
    XLSX.writeFile(wb, "Pension_Report.xlsx");
  };

  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  const format_date = (date) => {
    const arr = date.split("_");
    return arr[1] + "-" + toTitleCase(arr[2]) + "-" + arr[3];
  };

  if (!rawData) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6">
        CONSOLIDATED REPORT OF PENSIONER'S PENSION PAYMENT
      </h2>

      {rawData && rawData.length >= 1 && (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p>
                <strong>NAME:</strong> {rawData[0].name}
              </p>
              <p>
                <strong>PPONO:</strong> {rawData[0].PPoNo}
              </p>
            </div>
            <div className="space-x-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={downloadPdf}
              >
                Download as Pdf
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={downloadXlsx}
              >
                Download as Xlsx
              </button>
            </div>
          </div>

          <table className="w-full border text-center mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Sl.No</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Pension</th>
                <th className="border px-4 py-2">Income Tax</th>
                <th className="border px-4 py-2">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {rawData &&
                rawData.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">
                      {format_date(item.snapshot)}
                    </td>
                    <td className="border px-4 py-2">{item.total_pension}</td>
                    <td className="border px-4 py-2">{item.income_tax}</td>
                    <td className="border px-4 py-2">{item.net_pay}</td>
                  </tr>
                ))}
              <tr className="font-semibold">
                <td className="border px-4 py-2" colSpan={2}>
                  Grand Total
                </td>
                <td className="border px-4 py-2">
                  {totals.total_pension.toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {totals.income_tax.toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {totals.net_pay.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* <div>
            <p>
              <strong>Date of Birth:</strong> {formatDate(data.date_of_birth)}
            </p>
            <p>
              <strong>Date of Retire:</strong>{" "}
              {formatDate(data.date_of_retirement)}
            </p>
          </div> */}
        </>
      )}
    </div>
  );
};

export default ViewPensionDetails;
