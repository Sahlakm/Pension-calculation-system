import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Pensionerform.css";

const PensionerForm = () => {
  const [formData, setFormData] = useState({
    employee: {
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
    },
    pension: {
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
    }
  });

  const [pensionRules, setPensionRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPPONo, setSearchPPONo] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch pension rules from backend
  useEffect(() => {
    const fetchPensionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rulesResponse = await axios.get("/rules");
        setPensionRules(rulesResponse.data || []);
      } catch (error) {
        console.error("Error fetching pension data:", error);
        setError("Failed to load pension rules. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPensionData();
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // In your handleSearch function:
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/employees/${searchPPONo}`);
      const response1 = await axios.get(`/api/pension/${searchPPONo}`);
      
      // Format dates before setting state
      const formattedEmployeeData = {
        ...response.data,
        date_of_birth: formatDateForInput(response.data.date_of_birth),
        date_of_joining: formatDateForInput(response.data.date_of_joining),
        date_of_retirement: formatDateForInput(response.data.date_of_retirement)
      };
  
      setFormData(prev => ({
        ...prev,
        employee: formattedEmployeeData,
        pension: response1.data,
      }));
  
      setIsEditing(true);
      alert("Employee found. You can now edit the details.");
    } catch (error) {
      console.error("Error searching employee:", error);
      alert("Employee not found or error fetching data.");
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      employee: {
        ...prev.employee,
        [name]: prev.employee.hasOwnProperty(name) ? value : prev.employee[name] ?? prev.employee,
        address: {
          ...prev.employee.address,
          [name]: prev.employee.address?.hasOwnProperty(name) ? value : prev.employee.address,
        },
        bank: {
          ...prev.employee.bank,
          [name]: prev.employee.bank?.hasOwnProperty(name) ? value : prev.employee.bank,
        },
      },
      pension: {
        ...prev.pension,
        [name]: prev.pension.hasOwnProperty(name) ? value : prev.pension,
      },
    }));
  };
  
  // Submit Employee Details
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update existing employee
        await axios.put(`/api/employees/${formData.employee.PPoNo}`, formData.employee);
        setFormData(resetFormData());
        alert("Employee details updated successfully!");
      } else {
        // Create new employee
        await axios.post("/api/add-employee", formData.employee);
        alert("Employee details submitted successfully!");
      }

      // Update pension PPoNo to match employee PPoNo if it's empty
      if (!formData.pension.PPoNo) {
        setFormData(prev => ({
          ...prev,
          pension: {
            ...prev.pension,
            PPoNo: prev.employee.PPoNo
          }
        }));
      }
    } catch (error) {
      console.error("Error submitting employee details:", error);
      alert(`Failed to ${isEditing ? 'update' : 'submit'} employee details.`);
    }
  };

  // Submit Pension Details
  const handlePensionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/pension/${formData.pension.PPoNo}`, formData.pension);
        setFormData(resetFormData());
        alert("Pension details updated successfully!");
      } else {
        await axios.post("/api/add-pension-details", formData.pension);
        alert("Pension details submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting pension details:", error);
      alert(`Failed to ${isEditing ? 'update' : 'submit'} pension details.`);
    }
  };

  // Submit All (both employee and pension)
  const handleSubmitAll = async (e) => {
    e.preventDefault();
    await handleEmployeeSubmit(e);
    await handlePensionSubmit(e);
  };

  const resetFormData = () => {
    return {
      employee: {
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
      },
      pension: {
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
      }
    };
  };



  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete employee with PPO Number: ${formData.employee.PPoNo}?`)) {
      return;
    }

    try {
      // console.log("form data",formData);
      await axios.delete(`/api/employees/${formData.employee.PPoNo}`);
      await axios.delete(`api/pension/${formData.employee.PPoNo}`);
      alert("Employee deleted successfully!");
      setFormData(resetFormData());
      setIsEditing(false);
      setSearchPPONo("");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee.");
    }
  };

  if (loading) {
    return <div className="container">Loading pension rules...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return (
    <div className="container">
      <h2>Pension Management System</h2>

      {/* Search Section */}
      <div className="search-section">
        <h3>Search Employee</h3>
        <div className="search-form">
          <input
            type="number"
            placeholder="Enter PPO Number"
            value={searchPPONo}
            onChange={(e) => setSearchPPONo(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          {isEditing && (
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitAll}>
        {/* Employee Section */}
        <div className="form-section">
          <h3>Employee Details</h3>
          <label>PPoNo:</label>
          <input 
            type="number" 
            name="PPoNo" 
            value={formData.employee.PPoNo} 
            onChange={handleChange} 
            required 
            readOnly={isEditing} // PPO number shouldn't be editable when editing
          />

          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.employee.name} 
            onChange={handleChange} 
            required 
          />

          <label>Pension Rule:</label>
          <select 
            name="pension_rule" 
            value={formData.employee.pension_rule} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Pension Rule</option>
            {pensionRules.map((rule) => (
              <option key={rule.id} value={rule.value}>
                {rule.ruleName}
              </option>
            ))}
          </select>

          {/* Rest of your form fields... */}
          <label>Pension status:</label>
          <select name="pension_status" value={formData.pension.pension_status} onChange={handleChange}>
  <option value="">Select Pension Status</option>
  <option value="SERVICE PENSION">Service Pension</option>
  <option value="FAMILY PENSION">Family Pension</option>
  <option value="LEGAL HEIR">Legal Heir</option>
</select>

          
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.employee.email} 
            onChange={handleChange} 
            required 
          />

          <label>Phone Number:</label>
          <input 
            type="text" 
            name="phone_number" 
            value={formData.employee.phone_number} 
            onChange={handleChange} 
            required 
          />

          <label>Adhaar Number:</label>
          <input 
            type="text" 
            name="adhaar_number" 
            value={formData.employee.adhaar_number} 
            onChange={handleChange} 
            required 
          />
          
          <label>Date of Birth:</label>
          <input 
            type="date" 
            name="date_of_birth" 
            value={formData.employee.date_of_birth} 
            onChange={handleChange} 
            required 
          />

          <label>Date of Joining:</label>
          <input 
            type="date" 
            name="date_of_joining" 
            value={formData.employee.date_of_joining} 
            onChange={handleChange} 
            required 
          />

          <label>Date of Retirement:</label>
          <input 
            type="date" 
            name="date_of_retirement" 
            value={formData.employee.date_of_retirement} 
            onChange={handleChange} 
            required 
          />

          <h4>Address</h4>
          <label>Line 1:</label>
          <input 
            type="text" 
            name="line1" 
            value={formData.employee.address.line1} 
            onChange={handleChange} 
            required 
          />

          <label>Line 2:</label>
          <input 
            type="text" 
            name="line2" 
            value={formData.employee.address.line2} 
            onChange={handleChange} 
          />

          <label>Pincode:</label>
          <input 
            type="text" 
            name="pincode" 
            value={formData.employee.address.pincode} 
            onChange={handleChange} 
            required 
          />

          <h4>Bank Account Details</h4>
          <label>Account Number:</label>
          <input 
            type="number" 
            name="account_number" 
            value={formData.employee.bank.account_number} 
            onChange={handleChange} 
            required 
          />

          <label>IFSC Code:</label>
          <input 
            type="text" 
            name="ifsc_code" 
            value={formData.employee.bank.ifsc_code} 
            onChange={handleChange} 
            required 
          />

          <label>Bank Address:</label>
          <input 
            type="text" 
            name="address" 
            value={formData.employee.bank.address} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Pension Section */}
        <div className="form-section">
          <h3>Pension Details</h3>
          <label>PPoNo:</label>
          <input 
            type="number" 
            name="PPoNo" 
            value={formData.pension.PPoNo || formData.employee.PPoNo} 
            onChange={handleChange} 
            required 
            readOnly={isEditing}
          />

           <label>Basic:</label>
          <input 
            type="number" 
            name="basic" 
            value={formData.pension.basic} 
            onChange={handleChange} 
            required 
          />

          <label>Medical Allowance:</label>
          <input 
            type="number" 
            name="medi_allowance" 
            value={formData.pension.medi_allowance} 
            onChange={handleChange} 
            required 
          />

          <label>Total Pension:</label>
          <input 
            type="number" 
            name="total_pension" 
            value={formData.pension.total_pension} 
            onChange={handleChange} 
            required 
          />

          <label>Net Pay:</label>
          <input 
            type="number" 
            name="net_pay" 
            value={formData.pension.net_pay} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="button-group">
          <button type="submit">
            {isEditing ? "Update" : "Save"}
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setFormData(resetFormData());
                setSearchPPONo("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PensionerForm;