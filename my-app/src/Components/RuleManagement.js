import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import "./RuleManagement.css";

const RuleManagement = () => {
	const [rules, setRules] = useState([]);
	const [editingRule, setEditingRule] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const { register, handleSubmit, reset, setValue, control } = useForm({
		defaultValues: {
			parameters: [{ key: "", value: "" }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "parameters",
	});

	useEffect(() => {
		const fetchRules = async () => {
			setIsLoading(true);
			try {
				const response = await axios.get("/rules");
				setRules(response.data);
			} catch (err) {
				setError("Failed to fetch rules");
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchRules();
	}, []);

	const onSubmit = async (data) => {
		console.log(data);
		const formattedParameters = {};
		data.parameters.forEach((param) => {
			if (param.key.trim()) {
				formattedParameters[param.key] = param.value;
			}
		});

		const payload = {
			ruleName: data.ruleName,
			description: data.description,
			isActive: data.isActive || false,
			basic_pension: Number(data.basic_pension),
			dp_a: Number(data.dp_a),
			parameters: formattedParameters,
			employmentType: data.employmentType,
		};

		try {
			let response;
			if (editingRule) {
				response = await axios.put(
					`/rules/${editingRule._id}`,
					payload,
				);
				setRules(
					rules.map((rule) =>
						rule._id === editingRule._id ? response.data : rule,
					),
				);
			} else {
				console.log(payload);
				response = await axios.post("/rules", payload);
				setRules([response.data, ...rules]);
			}
			resetForm();
		} catch (err) {
			setError(err.response?.data?.message || "Operation failed");
			console.error(err);
		}
	};

	const handleEdit = (rule) => {
		setEditingRule(rule);
		setValue("ruleName", rule.ruleName);
		setValue("description", rule.description);
		setValue("isActive", rule.isActive);
		setValue("basic_pension", rule.basic_pension);
		setValue("dp_a", rule.dp_a);
		setValue("employmentType", rule.employmentType);

		const paramFields = Object.entries(rule.parameters || {}).map(
			([key, value]) => ({ key, value }),
		);
		reset({
			...rule,
			parameters: paramFields.length
				? paramFields
				: [{ key: "", value: "" }],
		});
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this rule?")) {
			try {
				await axios.delete(`/rules/${id}`);
				setRules(rules.filter((rule) => rule._id !== id));
				if (editingRule && editingRule._id === id) {
					resetForm();
				}
			} catch (err) {
				setError("Failed to delete rule");
				console.error(err);
			}
		}
	};

	const resetForm = () => {
		reset({
			ruleName: "",
			description: "",
			isActive: false,
			basic_pension: 0,
			dp_a: 0,
			employmentType: null,
			parameters: [{ key: "", value: "" }],
		});
		setEditingRule(null);
		setError("");
	};

	return (
		<div className='rule-management'>
			<h2>Rule Management</h2>

			<div className='rule-form'>
				<h3>{editingRule ? "Edit Rule" : "Add New Rule"}</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='form-group'>
						<label>Rule Name</label>
						<input
							{...register("ruleName", {
								required: "Rule name is required",
							})}
							type='text'
						/>
					</div>

					<div className='form-group'>
						<label>Description</label>
						<textarea {...register("description")} rows='3' />
					</div>

					<div className='form-group'>
						<label>Employment Type</label>
						<select
							{...register("employmentType")}
							defaultValue='Teaching'
							className='form-control'>
							<option value='Teaching'>TEACHING</option>
							<option value='Non-Teaching'>NON TEACHING</option>
						</select>
					</div>

					<div className='form-group'>
						<label>Basic Pension</label>
						<input
							{...register("basic_pension", { required: true })}
							type='number'
							step='0.01'
						/>
					</div>

					<div className='form-group'>
						<label>DP A</label>
						<input
							{...register("dp_a", { required: true })}
							type='number'
							step='0.01'
						/>
					</div>

					<div className='form-group checkbox'>
						<table>
							<tbody>
								<tr>
									<td>
										<input
											{...register("isActive")}
											type='checkbox'
										/>
									</td>
									<td>Active</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className='form-group'>
						<label>Parameters</label>
						<table className='form-table'>
							<tbody>
								{fields.map((field, index) => (
									<tr key={field.id} className='param-row'>
										<td>
											<input
												placeholder='Key'
												{...register(
													`parameters.${index}.key`,
												)}
												type='text'
											/>
										</td>
										<td>
											<input
												placeholder='Value'
												{...register(
													`parameters.${index}.value`,
												)}
												type='text'
											/>
										</td>
										<td>
											<button
												type='button'
												onClick={() => remove(index)}>
												Remove
											</button>
										</td>
									</tr>
								))}
								<button
									type='button'
									onClick={() =>
										append({ key: "", value: "" })
									}>
									Add Parameter
								</button>
							</tbody>
						</table>
					</div>

					<div className='form-actions param-row'>
						<button type='submit' className='btn-primary'>
							{editingRule ? "Update Rule" : "Add Rule"}
						</button>
						{editingRule && (
							<button
								type='button'
								onClick={resetForm}
								className='btn-secondary'>
								Cancel
							</button>
						)}
					</div>
				</form>
				{error && <div className='error-message'>{error}</div>}
			</div>

			<div className='rules-list'>
				<h3>Existing Rules</h3>
				{isLoading ? (
					<div>Loading rules...</div>
				) : rules.length === 0 ? (
					<div>No rules found</div>
				) : (
					<table>
						<thead>
							<tr>
								<th>Rule Name</th>
								<th>Description</th>
								<th>Basic Pension</th>
								<th>DP A</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{rules.map((rule) => (
								<tr key={rule._id}>
									<td>{rule.ruleName}</td>
									<td>{rule.description || "-"}</td>
									<td>{rule.basic_pension}</td>
									<td>{rule.dp_a}</td>
									<td>
										<span
											className={`status ${
												rule.isActive
													? "active"
													: "inactive"
											}`}>
											{rule.isActive
												? "Active"
												: "Inactive"}
										</span>
									</td>
									<td>
										<button
											onClick={() => handleEdit(rule)}
											className='btn-edit'>
											Edit
										</button>
										<button
											onClick={() =>
												handleDelete(rule._id)
											}
											className='btn-delete'>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default RuleManagement;
