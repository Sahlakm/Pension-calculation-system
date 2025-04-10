import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DrValueForm.css"; // Make sure the path is correct

const DrValueForm = () => {
	// State to store form values
	const [fromDate, setFromDate] = useState(null);
	const [toDate, setToDate] = useState(null);
	const [drValue, setDrValue] = useState("");
	const [drValues, setDrValues] = useState([]);
	const [editing, setEditing] = useState(null); // Track which row is being edited

	const clearForm = () => {
		setFromDate(null);
		setToDate(null);
		setDrValue("");
		setEditing(null);
	};

	// Fetch existing DR values
	const fetchDrValues = async () => {
		try {
			const response = await axios.get("/drvalues");
			setDrValues(response.data);
		} catch (error) {
			console.error("Error fetching DR values:", error);
		}
	};

	useEffect(() => {
		fetchDrValues();
	}, []);

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!fromDate || !toDate || !drValue) {
			alert("Please fill in all fields!");
			return;
		}

		const newDrValue = {
			from: fromDate.toISOString(),
			to: toDate.toISOString(),
			dr_value: Number(drValue),
		};

		try {
			if (editing) {
				// Edit existing entry
				await axios.put(`/drvalues/${editing}`, newDrValue);
				setEditing(null); // Reset editing state after update
			} else {
				// Create new entry
				await axios.post("/drvalues/new", newDrValue);
			}

			// Fetch updated DR values
			fetchDrValues();
			// Reset form
			setFromDate(null);
			setToDate(null);
			setDrValue("");
		} catch (error) {
			console.error("Error submitting DR value:", error);
			alert("Error submitting the DR value! Check for date overlaps.");
		}
	};

	// Edit an existing entry
	const handleEdit = (id) => {
		const drValueToEdit = drValues.find((entry) => entry._id === id);
		if (drValueToEdit) {
			const fromDateParts = drValueToEdit.from.split("-");
			const toDateParts = drValueToEdit.to.split("-");

			// Create Date objects (Month is 0-indexed, so we subtract 1 from the month)
			const parsedFromDate = new Date(
				`${fromDateParts[2]}-${fromDateParts[1]}-${fromDateParts[0]}`,
			);
			const parsedToDate = new Date(
				`${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`,
			);

			setFromDate(parsedFromDate);
			setToDate(parsedToDate);
			setDrValue(drValueToEdit.dr_value);
			setEditing(id); // Mark as editing
		}
	};

	return (
		<div className="drform">
			<h1>DR Value Form</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label>From Date:</label>
					<DatePicker
						selected={fromDate}
						onChange={(date) => setFromDate(date)}
						dateFormat='dd-MM-yyyy'
						placeholderText='Select From Date'
						required
					/>
				</div>

				<div>
					<label>To Date:</label>
					<DatePicker
						selected={toDate}
						onChange={(date) => setToDate(date)}
						dateFormat='dd-MM-yyyy'
						placeholderText='Select To Date'
						required
					/>
				</div>

				<div>
					<label>DR Value:</label>
					<input
						type='number'
						value={drValue}
						onChange={(e) => setDrValue(e.target.value)}
						required
					/>
				</div>

				<div>
					<button
						onClick={clearForm}
						style={{
							backgroundColor: "white",
							color: "#007bff",
						}}>
						Clear
					</button>{" "}
					<button type='submit'>
						{editing ? "Update" : "Submit"}
					</button>
				</div>
			</form>

			<h2>DR Values List</h2>
			<table>
				<thead>
					<tr>
						{/* <th>_id</th> */}
						<th>From Date</th>
						<th>To Date</th>
						<th>DR Value</th>
						<th>Edit</th>
					</tr>
				</thead>
				<tbody>
					{drValues.map((entry) => (
						<tr key={entry._id}>
							{/* <td>{entry._id}</td> */}
							<td>{entry.from}</td>
							<td>{entry.to}</td>
							<td>{entry.dr_value}</td>
							<td>
								<button onClick={() => handleEdit(entry._id)}>
									Edit
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default DrValueForm;
