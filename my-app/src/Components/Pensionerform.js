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
			medi_allowance: "",
			other_allowance: "",
			other_deduction: "",
			income_tax: "",
			reduced_pension: "",
		},
	});

	const [pensionRules, setPensionRules] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchPPONo, setSearchPPONo] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
				setError(
					"Failed to load pension rules. Please try again later.",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchPensionData();
	}, []);

	const formatDateForInput = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toISOString().split("T")[0];
	};

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!searchPPONo) {
			alert("Please enter a PPO Number");
			return;
		}

		try {
			setLoading(true);
			const [employeeResponse, pensionResponse] = await Promise.all([
				axios.get(`/api/employees/${searchPPONo}`),
				axios.get(`/api/pension/${searchPPONo}`),
			]);

			// Format dates before setting state
			const formattedEmployeeData = {
				...employeeResponse.data,
				date_of_birth: formatDateForInput(
					employeeResponse.data.date_of_birth,
				),
				date_of_joining: formatDateForInput(
					employeeResponse.data.date_of_joining,
				),
				date_of_retirement: formatDateForInput(
					employeeResponse.data.date_of_retirement,
				),
			};

			setFormData((prev) => ({
				...prev,
				employee: formattedEmployeeData,
				pension: pensionResponse.data,
			}));

			setIsEditing(true);
		} catch (error) {
			console.error("Error searching employee:", error);
			alert("Employee not found or error fetching data.");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Handle nested objects (address and bank)
		if (name.startsWith("address.")) {
			const field = name.split(".")[1];
			setFormData((prev) => ({
				...prev,
				employee: {
					...prev.employee,
					address: {
						...prev.employee.address,
						[field]: value,
					},
				},
			}));
		} else if (name.startsWith("bank.")) {
			const field = name.split(".")[1];
			setFormData((prev) => ({
				...prev,
				employee: {
					...prev.employee,
					bank: {
						...prev.employee.bank,
						[field]: value,
					},
				},
			}));
		} else if (name in formData.employee) {
			setFormData((prev) => ({
				...prev,
				employee: {
					...prev.employee,
					[name]: value,
				},
			}));
		} else if (name in formData.pension) {
			setFormData((prev) => ({
				...prev,
				pension: {
					...prev.pension,
					[name]: value,
				},
			}));
		}
	};

	// Submit Employee Details
	const handleEmployeeSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			if (isEditing) {
				await axios.put(
					`/api/employees/${formData.employee.PPoNo}`,
					formData.employee,
				);
				alert("Employee details updated successfully!");
			} else {
				console.log("formdata ", formData);
				await axios.post("/api/add-employee", formData.employee);
				alert("Employee details submitted successfully!");
			}

			// Update pension PPoNo to match employee PPoNo if it's empty
			if (!formData.pension.PPoNo) {
				setFormData((prev) => ({
					...prev,
					pension: {
						...prev.pension,
						PPoNo: prev.employee.PPoNo,
					},
				}));
			}
		} catch (error) {
			console.error("Error submitting employee details:", error);
			alert(
				`Failed to ${
					isEditing ? "update" : "submit"
				} employee details.`,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Submit Pension Details
	const handlePensionSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			if (isEditing) {
				await axios.put(
					`/api/pension/${formData.pension.PPoNo}`,
					formData.pension,
				);
				alert("Pension details updated successfully!");
			} else {
				formData.pension.PPoNo = formData.employee.PPoNo;
				console.log(formData.pension);
				// Ensure PPoNo is set
				await axios.post("/api/add-pension-details", formData.pension);
				alert("Pension details submitted successfully!");
			}
		} catch (error) {
			console.error("Error submitting pension details:", error);
			alert(
				`Failed to ${isEditing ? "update" : "submit"} pension details.`,
			);
		} finally {
			setIsSubmitting(false);
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
				medi_allowance: "",
				other_allowance: "",
				other_deduction: "",
				income_tax: "",
				reduced_pension: "",
			},
		};
	};

	const handleDelete = async () => {
		if (
			!window.confirm(
				`Are you sure you want to delete employee with PPO Number: ${formData.employee.PPoNo}?`,
			)
		) {
			return;
		}

		try {
			await axios.delete(`/api/employees/${formData.employee.PPoNo}`);
			await axios.delete(`/api/pension/${formData.employee.PPoNo}`);
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
		return <div className='container'>Loading pension rules...</div>;
	}

	if (error) {
		return <div className='container error'>{error}</div>;
	}

	return (
		<div className='container pensionform'>
			<h2>Pension Management System</h2>

			{/* Search Section */}
			<div className='search-section'>
				<h3>Search Employee</h3>
				<div className='search-form'>
					<input
						type='number'
						placeholder='Enter PPO Number'
						value={searchPPONo}
						onChange={(e) => setSearchPPONo(e.target.value)}
						required
					/>
					<button onClick={handleSearch} disabled={loading}>
						{loading ? "Searching..." : "Search"}
					</button>
					{isEditing && (
						<button
							className='delete-btn'
							onClick={handleDelete}
							disabled={isSubmitting}>
							Delete
						</button>
					)}
				</div>
			</div>

			<form onSubmit={handleSubmitAll}>
				{/* Employee Section */}
				<div className='form-section'>
					<h3>Employee Details</h3>
					<label>PPoNo:</label>
					<input
						type='number'
						name='PPoNo'
						value={formData.employee.PPoNo}
						onChange={handleChange}
						required
						readOnly={isEditing}
					/>

					<label>Name:</label>
					<input
						type='text'
						name='name'
						value={formData.employee.name}
						onChange={handleChange}
						required
					/>

					<label>Pension Rule:</label>
					<select
						name='pension_rule'
						value={formData.employee.pension_rule}
						onChange={handleChange}
						required>
						<option value=''>Select Pension Rule</option>
						{pensionRules.map((rule) => (
							<option key={rule.id} value={rule.value}>
								{rule.ruleName}
							</option>
						))}
					</select>

					<label>Pension status:</label>
					<select
						name='pension_status'
						value={formData.employee.pension_status}
						onChange={handleChange}
						required>
						<option value=''>Select Pension Status</option>
						<option value='SERVICE PENSION'>Service Pension</option>
						<option value='FAMILY PENSION'>Family Pension</option>
						<option value='LEGAL HEIR'>Legal Heir</option>
					</select>

					<label>Email:</label>
					<input
						type='email'
						name='email'
						value={formData.employee.email}
						onChange={handleChange}
						required
					/>

					<label>Phone Number:</label>
					<input
						type='tel'
						name='phone_number'
						value={formData.employee.phone_number}
						onChange={handleChange}
						required
						pattern='[0-9]{10}'
					/>

					<label>Aadhaar Number:</label>
					<input
						type='text'
						name='adhaar_number'
						value={formData.employee.adhaar_number}
						onChange={handleChange}
						required
						pattern='[0-9]{12}'
					/>

					<label>Date of Birth:</label>
					<input
						type='date'
						name='date_of_birth'
						value={formData.employee.date_of_birth}
						onChange={handleChange}
						required
						max={new Date().toISOString().split("T")[0]}
					/>

					<label>Date of Joining:</label>
					<input
						type='date'
						name='date_of_joining'
						value={formData.employee.date_of_joining}
						onChange={handleChange}
						required
					/>

					<label>Date of Retirement:</label>
					<input
						type='date'
						name='date_of_retirement'
						value={formData.employee.date_of_retirement}
						onChange={handleChange}
						required
					/>

					<h4>Address</h4>
					<label>Line 1:</label>
					<input
						type='text'
						name='address.line1'
						value={formData.employee.address.line1}
						onChange={handleChange}
						required
					/>

					<label>Line 2:</label>
					<input
						type='text'
						name='address.line2'
						value={formData.employee.address.line2}
						onChange={handleChange}
					/>

					<label>Line 3:</label>
					<input
						type='text'
						name='address.line3'
						value={formData.employee.address.line3}
						onChange={handleChange}
					/>

					<label>Pincode:</label>
					<input
						type='text'
						name='address.pincode'
						value={formData.employee.address.pincode}
						onChange={handleChange}
						required
						pattern='[0-9]{6}'
					/>

					<h4>Bank Account Details</h4>
					<label>Account Number:</label>
					<input
						type='text'
						name='bank.account_number'
						value={formData.employee.bank.account_number}
						onChange={handleChange}
						required
					/>

					<label>IFSC Code:</label>
					<input
						type='text'
						name='bank.ifsc_code'
						value={formData.employee.bank.ifsc_code}
						onChange={handleChange}
						required
					/>

					<label>Bank Address:</label>
					<input
						type='text'
						name='bank.address'
						value={formData.employee.bank.address}
						onChange={handleChange}
						required
					/>
				</div>

				<br></br>

				{/* Pension Section */}
				<div className='form-section'>
					<h3>Pension and Tax Details</h3>
					<label>PPoNo:</label>
					<input
						type='number'
						name='PPoNo'
						value={
							formData.pension.PPoNo || formData.employee.PPoNo
						}
						onChange={handleChange}
						required
						readOnly={isEditing}
					/>

					<label>Medical Allowance:</label>
					<input
						type='number'
						name='medi_allowance'
						value={formData.pension.medi_allowance}
						onChange={handleChange}
						min='0'
					/>

					<label>Other Allowance:</label>
					<input
						type='number'
						name='other_allowance'
						value={formData.pension.other_allowance}
						onChange={handleChange}
						min='0'
					/>

					<label>Other Deduction:</label>
					<input
						type='number'
						name='other_deduction'
						value={formData.pension.other_deduction}
						onChange={handleChange}
						min='0'
					/>

					<label>Income Tax:</label>
					<input
						type='number'
						name='income_tax'
						value={formData.pension.income_tax}
						onChange={handleChange}
						min='0'
					/>

					<label>Reduced Pension:</label>
					<input
						type='number'
						name='reduced_pension'
						value={formData.pension.reduced_pension}
						onChange={handleChange}
						min='0'
					/>
				</div>

				<div className='button-group'>
					<button type='submit' disabled={isSubmitting}>
						{isSubmitting
							? "Processing..."
							: isEditing
							? "Update"
							: "Save"}
					</button>
					{isEditing && (
						<button
							type='button'
							onClick={() => {
								setIsEditing(false);
								setFormData(resetFormData());
								setSearchPPONo("");
							}}
							disabled={isSubmitting}>
							Cancel Edit
						</button>
					)}
				</div>
			</form>
		</div>
	);
};

export default PensionerForm;
