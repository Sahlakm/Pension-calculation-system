import React, { useState } from "react";
import axios from "axios";
import "./Pensionerform.css";

const PensionerForm = () => {
  const [formData, setFormData] = useState({
    PPoNo: "",
    name: "",
    pension_rule: "",
    pension_status: "",
    email: "",
    phone_number: "",
    adhaar_number: "",
    date_of_birth: "",
    date_of_joining: "",
    date_of_retirement: "",
    address: {
      line1: "",
      line2: "",
      line3: "",
      pincode: "",
    },
    bank: {
      account_number: "",
      ifsc_code: "",
      address: "",
    },
  });

  const [pensionDetails, setPensionDetails] = useState({
    PPoNo: "",
    basic: "",
    dp_a: "",
    medi_allowance: "",
    other_allowance: "",
    other_deduction: "",
    income_tax: "",
    dr: "",
    total: "",
    reduced_pension: "",
    total_pension: "",
    net_pay: "",
  });

  // Handle change for employee details
  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle change for nested address fields
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  // Handle change for bank details
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        [name]: value,
      },
    }));
  };

  // Handle change for pension details
  const handlePensionChange = (e) => {
    const { name, value } = e.target;
    setPensionDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Employee Details
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const empResponse = await axios.post("/api/add-employee", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Employee Data Saved:", empResponse.data);
      alert("Employee details submitted successfully!");

      // Reset Employee Form
      setFormData({
        PPoNo: "",
        name: "",
        pension_rule: "",
        pension_status: "",
        email: "",
        phone_number: "",
        adhaar_number: "",
        date_of_birth: "",
        date_of_joining: "",
        date_of_retirement: "",
        address: { line1: "", line2: "", line3: "", pincode: "" },
        bank: {
          account_number: "",
          ifsc_code: "",
          address: "",
        },
      });
    } catch (error) {
      console.error("Error submitting employee details:", error.response?.data || error.message);
      alert("Failed to submit employee details.");
    }
  };

  // Submit Pension Details
  const handlePensionSubmit = async (e) => {
    e.preventDefault();
    try {
      const pensionResponse = await axios.post("/api/add-pension-details", pensionDetails, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Pension Data Saved:", pensionResponse.data);
      alert("Pension details submitted successfully!");

      // Reset Pension Form
      setPensionDetails({
        PPoNo: "",
        basic: "",
        dp_a: "",
        medi_allowance: "",
        other_allowance: "",
        other_deduction: "",
        income_tax: "",
        dr: "",
        total: "",
        reduced_pension: "",
        total_pension: "",
        net_pay: "",
      });
    } catch (error) {
      console.error("Error submitting pension details:", error.response?.data || error.message);
      alert("Failed to submit pension details.");
    }
  };

  return (
    <div className="container">
      <h2>Pension Management System</h2>

      {/* Employee Form */}
      <form onSubmit={handleEmployeeSubmit}>
        <h3>Employee Details</h3>
        <label>PPoNo:</label>
        <input type="number" name="PPoNo" value={formData.PPoNo} onChange={handleEmployeeChange} required />

        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleEmployeeChange} required />

        <label>Pension Rule:</label>
        <select name="pension_rule" value={formData.pension_rule} onChange={handleEmployeeChange} required>
          <option value="">Select Pension Rule</option>
          <option value="SIXTH PAY NON-TEACHING STAFF (STATE)">SIXTH PAY NON-TEACHING STAFF (STATE)</option>
          <option value="SEVENTH PAY NON-TEACHING STAFF (STATE)">SEVENTH PAY NON-TEACHING STAFF (STATE)</option>
        </select>

        <label>Pension Status:</label>
        <select name="pension_status" value={formData.pension_status} onChange={handleEmployeeChange} required>
          <option value="">Select Pension Status</option>
          <option value="SERVICE PENSION">SERVICE PENSION</option>
          <option value="FAMILY PENSION">FAMILY PENSION</option>
        </select>

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleEmployeeChange} required />

        <label>Phone Number:</label>
        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleEmployeeChange} required />

        <label>Adhaar Number:</label>
        <input type="text" name="adhaar_number" value={formData.adhaar_number} onChange={handleEmployeeChange} required />
        
        <label>Date of Birth:</label>
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleEmployeeChange} required />

        <label>Date of Joining:</label>
        <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleEmployeeChange} required />

        <label>Date of Retirement:</label>
        <input type="date" name="date_of_retirement" value={formData.date_of_retirement} onChange={handleEmployeeChange} required />

        <h3>Address</h3>
        <label>Line 1:</label>
        <input type="text" name="line1" value={formData.address.line1} onChange={handleAddressChange} required />

        <label>Line 2:</label>
        <input type="text" name="line2" value={formData.address.line2} onChange={handleAddressChange} />

        <label>Pincode:</label>
        <input type="text" name="pincode" value={formData.address.pincode} onChange={handleAddressChange} required />

        <h3>Bank Account Details</h3>
        <label>Account Number:</label>
        <input type="number" name="account_number" value={formData.bank.account_number} onChange={handleBankChange} required />

        <label>IFSC Code:</label>
        <input type="text" name="ifsc_code" value={formData.bank.ifsc_code} onChange={handleBankChange} required />

        <label>Bank Address:</label>
        <input type="text" name="address" value={formData.bank.address} onChange={handleBankChange} required />

        <button type="submit">Submit Employee Details</button>
      </form>

      {/* Pension Form */}
      <form onSubmit={handlePensionSubmit}>
        <h3>Pension Details</h3>
        <label>PPoNo:</label>
        <input type="number" name="PPoNo" value={pensionDetails.PPoNo} onChange={handlePensionChange} required />

        <label>Basic:</label>
        <input type="number" name="basic" value={pensionDetails.basic} onChange={handlePensionChange} required />

        <label>Medical Allowance:</label>
        <input type="number" name="medi_allowance" value={pensionDetails.medi_allowance} onChange={handlePensionChange} required />

        <label>Total Pension:</label>
        <input type="number" name="total_pension" value={pensionDetails.total_pension} onChange={handlePensionChange} required />

        <label>Net Pay:</label>
        <input type="number" name="net_pay" value={pensionDetails.net_pay} onChange={handlePensionChange} required />

        <button type="submit">Submit Pension Details</button>
      </form>
    </div>
  );
};

export default PensionerForm;