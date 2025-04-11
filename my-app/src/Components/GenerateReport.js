import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";

export default function GenerateReport({ user }) {
  const [snapshotData, setSnapshotData] = useState([]);
  const [filteredData_, setFilteredData] = useState([]);
  const [day, setDay] = useState("01");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2025");
  const [empType, setEmpType] = useState("All");

  useEffect(() => {
    if (!user) return;

    const fetchSnapshot = async () => {
      try {
        const formattedMonth = month.toLowerCase().slice(0, 3);
        // const url = `/snapshot/monthly_snapshot_${formattedMonth}_${year}`;
        const url = `/snapshot/daily_snapshot_${day}_${formattedMonth}_${year}`;
        const res = await axios.get(url);
        setSnapshotData(res.data);
      } catch (err) {
        console.error("Error fetching snapshot data:", err);
        setSnapshotData([]);
      }
    };

    fetchSnapshot();
  }, [user, day, month, year]);

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600 text-lg font-medium">
        Rendering ⚙️
      </div>
    );
  }

  const filteredData = snapshotData.filter((item) => {
    // if (day) {
    //   const itemDate = new Date(item.date);
    //   if (itemDate.getDate() !== parseInt(day, 10)) {
    //     return false;
    //   }
    // }
    if (user.userType === "Admin") {
      return empType === "All" || item.employment_type === empType;
    } else {
      return item.PPoNo === user.PPoNo;
    }
  });

  const parseMonthYear = (monthStr) => {
    try {
      const [monthPart, yearPart] = monthStr.split("-");
      return new Date(`01 ${monthPart} ${yearPart}`);
    } catch {
      return new Date(); // fallback to current date
    }
  };

  const downloadPDF = (row) => {
    const personData = snapshotData.filter((item) => item.PPoNo === row.PPoNo);

    const doc = new jsPDF("p", "pt");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("NATIONAL INSTITUTE OF TECHNOLOGY CALICUT", 300, 20, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("CONSOLIDATED REPORT OF PENSION PAYMENT", 290, 40, {
      align: "center",
    });

    // const monthsCovered = personData.map((d) =>
    //   parseMonthYear(d.month)
    //     .toLocaleString("default", {
    //       day: "numeric",
    //       month: "short",
    //       year: "numeric",
    //     })
    //     .toUpperCase()
    // );

    // const periodText = `${monthsCovered[0]} to ${
    //   monthsCovered[monthsCovered.length - 1]
    // }`;

    // doc.text(periodText, 460, 60);
    doc.text(`NAME:     ${row.name}`, 40, 90);
    doc.text(`PPoNo:    ${row.PPoNo}`, 40, 110);

    let slNo = 1;
    let totalPension = 0;
    let totalTax = 0;
    let totalDR = 0;
    let totalNetPay = 0;

    const tableBody = personData.map((item) => {
      const pension = parseFloat(item.basic_pension || 0);
      const tax = parseFloat(item.income_tax || 0);
      const dr = parseFloat(item.dr || 0);
      const net = parseFloat(item.net_pay || 0);

      totalPension += pension;
      totalTax += tax;
      totalDR += dr;
      totalNetPay += net;

      return [
        slNo++,
        parseMonthYear(item.month)
          .toLocaleString("default", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .toUpperCase(),
        pension.toLocaleString("en-IN"),
        tax.toLocaleString("en-IN"),
        dr.toLocaleString("en-IN"),
        net.toLocaleString("en-IN"),
      ];
    });

    autoTable(doc, {
      startY: 130,
      head: [
        [
          "Sl.No",
          "Date",
          "Pension Calculated",
          "Tax",
          "DR",
          "Net Pay",
        ],
      ],
      body: tableBody,
      theme: "grid",
      styles: { halign: "center" },
      foot: [
        [
          "",
          "Grand Total",
          totalPension.toLocaleString("en-IN"),
          totalTax.toLocaleString("en-IN"),
          totalDR.toLocaleString("en-IN"),
          totalNetPay.toLocaleString("en-IN"),
        ],
      ],
    });

    doc.text(
      `Date of Birth:      ${row.date_of_birth.split("T")[0] || "N/A"}`,
      40,
      doc.lastAutoTable.finalY + 30
    );
    doc.text(
      `Date of Retire:    ${row.date_of_retirement.split("T")[0] || "N/A"}`,
      40,
      doc.lastAutoTable.finalY + 50
    );

    doc.save(
      `${row.name.replace(/\s+/g, "_")}_Pension_Report.pdf`
    );
  };

  const downloadExcel = (row) => {
    const wb = XLSX.utils.book_new();
    const sheetData = [
      ["NATIONAL INSTITUTE OF TECHNOLOGY CALICUT"],
      [
        "CONSOLIDATED REPORT OF PENSION PAYMENT",
        `${day}-${month.toUpperCase()}-${year}`,
      ],
      [],
      ["NAME:", row.name],
      ["PPoNo:", row.PPoNo],
      [],
      ["Sl.No", "Date", "Pension Calculated", "Tax", "DR", "Net Pay"],
    ];

    let slNo = 1;
    let totalPension = 0;
    let totalTax = 0;
    let totalDR = 0;
    let totalNetPay = 0;

    const rowData = filteredData
      .filter((item) => item.PPoNo === row.PPoNo)
      .map((item) => {
        const pension = parseFloat(item.basic_pension || 0);
        const tax = parseFloat(item.income_tax || 0);
        const dr = parseFloat(item.dr || 0);
        const net = parseFloat(item.net_pay || 0);

        totalPension += pension;
        totalTax += tax;
        totalDR += dr;
        totalNetPay += net;

        return [
          slNo++,
          parseMonthYear(item.month).toLocaleString("default", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          pension,
          tax,
          dr,
          net,
        ];
      });

    sheetData.push(...rowData);
    sheetData.push([
      "",
      "Grand Total",
      totalPension,
      totalTax,
      totalDR,
      totalNetPay,
    ]);

    sheetData.push([]);
    sheetData.push([
      "Date of Birth:",
      row.date_of_birth.split("T")[0] || "N/A",
    ]);
    sheetData.push([
      "Date of Retire:",
      row.date_of_retirement.split("T")[0] || "N/A",
    ]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "PensionReport");
    XLSX.writeFile(wb, `${row.name}_Pension_Report_${month}_${year}.xlsx`);
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

    // Title and subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NATIONAL INSTITUTE OF TECHNOLOGY CALICUT", 60, 15, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      `CONSOLIDATED REPORT OF PENSION PAYMENT ON ${day}-${month.toUpperCase()}-${year} ${
        empType !== "All" ? `TO ${empType.toUpperCase()}` : ""
      }`,
      148.5,
      23,
      { align: "center" }
    );

    // Table columns matching the image
    const tableColumn = [
      "Sl.No",
      "PPONO",
      "NAME",
      "BASIC PEN",
      "DP/A PEN",
      "TOTAL",
      "REDUCED PEN",
      "DR",
      "MEDI ALLOW",
      "OTHER ALLOW",
      "TOTAL PEN",
      "OTHER DED",
      "INCOME TAX",
      "TOTAL DED",
      "NET PAY",
    ];

    // Table rows based on your data structure
    const tableRows = filteredData.map((row, i) => {
      const total = row.basic_pension + row.dp_a;
      return [
        i + 1,
        row.PPoNo,
        row.name,
        row.basic_pension,
        row.dp_a,
        total,
        row.reduced_pension,
        row.dr,
        row.medi_allowance,
        row.other_allowance,
        row.total_pension,
        row.other_deduction,
        row.income_tax,
        row.total_deduction,
        row.net_pay,
      ];
    });

    // Generate the table
    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8, cellPadding: 1 },
    });

    // Save the file
    doc.save("pension-report.pdf");
  };

  const handlePrintBankPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

    // Title and subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      "PENSION PAYMENT THROUGH STATE BANK OF INDIA CALICUT REC BRANCH",
      148.5,
      15,
      { align: "center" }
    );
    doc.setFontSize(12);
    doc.text(
      `FOR THE MONTH OF ${day}-${month.toUpperCase()}-${year} ${
        empType !== "All" ? `TO ${empType.toUpperCase()}` : ""
      }`,
      148.5,
      23,
      { align: "center" }
    );

    // Table header
    const tableColumn = [
      "Sl.No",
      "PPONO",
      "NAME",
      "ACCOUNT NUMBER",
      "AMOUNT",
      "BANK CODE",
      "BANK NAME",
    ];

    // Table body
    const tableRows = filteredData.map((row, i) => [
      i + 1,
      row.PPoNo,
      row.name,
      row.bank?.account_number || "N/A",
      row.net_pay.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      row.bank?.ifsc_code || "N/A",
      row.bank?.address || "N/A",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8, cellPadding: 1 },
    });

    doc.save("bank-wise-pension-report.pdf");
  };

  const handleDownloadConsolidatedExcel = () => {
    const heading1 = ["", "NATIONAL INSTITUTE OF TECHNOLOGY CALICUT"];
    const heading2 = [
      "",
      `CONSOLIDATED REPORT OF PENSION PAYMENT ON ${day}-${month.toUpperCase()}-${year}` +
        (empType !== "All" ? "TO " + empType.toUpperCase() : ""),
    ];
    const heading3 = [
      "Sl.No",
      "PPONO",
      "NAME",
      "BASIC PEN",
      "DP/A PEN",
      "TOTAL",
      "REDUCED PEN",
      "DR",
      "MEDI ALLOW",
      "OTHER ALLOW",
      "TOTAL PEN",
      "OTHER DED",
      "INCOME TAX",
      "TOTAL DED",
      "NET PAY",
    ];

    const tableData = filteredData.map((row, i) => {
      const total = row.basic_pension + row.dp_a;
      return Object.values({
        "Sl.No": i + 1,
        PPONO: row.PPoNo,
        NAME: row.name,
        "BASIC PEN": row.basic_pension,
        "DP/A PEN": row.dp_a,
        TOTAL: total,
        "REDUCED PEN": row.reduced_pension,
        DR: row.dr,
        "MEDI ALLOW": row.medi_allowance,
        "OTHER ALLOW": row.other_allowance,
        "TOTAL PEN": row.total_pension,
        "OTHER DED": row.other_deduction,
        "INCOME TAX": row.income_tax,
        "TOTAL DED": row.total_deduction,
        "NET PAY": row.net_pay,
      });
    });

    const allRows = [heading1, heading2, [], heading3, ...tableData];
    console.log(allRows);

    const ws = XLSX.utils.json_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consolidated Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `pension-consolidated-${month}-${year}.xlsx`);
  };

  const handleDownloadBankExcel = () => {
    const tableData = filteredData.map((row, i) => ({
      "Sl.No": i + 1,
      PPONO: row.PPoNo,
      NAME: row.name,
      "ACCOUNT NUMBER": row.bank?.account_number || "N/A",
      AMOUNT: row.net_pay.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      "BANK CODE": row.bank?.ifsc_code || "N/A",
      "BANK NAME": row.bank?.address || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bank Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `pension-bank-report-${day}-${month}-${year}.xlsx`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 border-b pb-2">
        {user.userType === "Admin" ? "Generate Reports" : "My Pension Report"}
      </h1>

      {user.userType === "Admin" && (
        <div className="flex flex-wrap gap-6 mb-6 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border rounded p-2"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded p-2"
            >
              {["January", "February", "March", "April"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded p-2"
            >
              {["2023", "2024", "2025"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Employee Type
            </label>
            <select
              value={empType}
              onChange={(e) => setEmpType(e.target.value)}
              className="border rounded p-2"
            >
              <option value="All">All</option>
              <option value="Teaching">Teaching</option>
              <option value="Non-Teaching">Non-Teaching</option>
            </select>
          </div>

          {snapshotData.length !== 0 && (
            <>
              {" "}
              <div className="flex justify-end" style={{
                display: "flex",
                flexDirection: "row"
              }}>
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium px-4 py-2 rounded-lg transition"
                >
                  <FileDown className="w-5 h-5" />
                  <span>Consolidated Report PDF</span>
                </button>
              </div>

              <div className="flex justify-end" style={{
                display: "flex",
                flexDirection: "row"
              }}>
                <button
                  onClick={handlePrintBankPDF}
                  className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium px-4 py-2 rounded-lg transition"
                >
                  <FileDown className="w-5 h-5" />
                  <span>Bank PDF</span>
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadConsolidatedExcel}
                  className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg transition"
                >
                  <FileDown className="w-5 h-5" />
                  <span>Consolidated Report XLSX</span>
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadBankExcel}
                  className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg transition"
                >
                  <FileDown className="w-5 h-5" />
                  <span>Bank Report XLSX</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="overflow-auto rounded-lg shadow border rules-list">
        <table className="min-w-full bg-white text-sm text-left">
          <thead className="bg-gray-100 font-semibold text-gray-700">
            <tr>
              <th className="p-3 border">SLNO</th>
              <th className="p-3 border">PPoNo</th>
              <th className="p-3 border">NAME</th>
              <th className="p-3 border">EMPLOYEE TYPE</th>
              {/* <th className="p-3 border">PENSION CALCULATED</th>
              <th className="p-3 border">TAX</th>
              <th className="p-3 border">DR</th> */}
              <th className="p-3 border">NET PAY</th>
              <th className="p-3 border text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No data available.
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr key={`${row.PPoNo}-${index}`} className="hover:bg-gray-50">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">{row.PPoNo}</td>
                  <td className="p-3 border">{row.name}</td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.employment_type === "Teaching"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.employment_type}
                    </span>
                  </td>
                  {/* <td className="p-3 border">₹{row.basic_pension}</td>
                  <td className="p-3 border">₹{row.income_tax}</td>
                  <td className="p-3 border">₹{row.dr}</td> */}
                  <td className="p-3 border">₹{row.net_pay}</td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => downloadPDF(row)}
                        title="Download PDF"
                        className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium px-4 py-2 rounded-lg transition"
                      >
                        <FileDown className="w-5 h-5" />
                        <span>Download as PDF</span>
                      </button>
                      <button
                        onClick={() => downloadExcel(row)}
                        title="Download Excel"
                        className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg transition"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download as Excel</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
