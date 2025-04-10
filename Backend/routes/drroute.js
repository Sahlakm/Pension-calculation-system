const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { DrValue } = require("../models/drvalues");

const formatDate = (date) => {
	const d = new Date(date);
	const day = d.getDate().toString().padStart(2, "0");
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const year = d.getFullYear();
	return `${day}-${month}-${year}`;
};

router.post("/new", async (req, res) => {
	try {
		const { from, to, dr_value } = req.body;

		if (!from || !to || dr_value === undefined) {
			return res.status(400).json({ error: "Missing fields" });
		}

		const fromDate = new Date(from);
		const toDate = new Date(to);

		if (toDate < fromDate) {
			return res
				.status(400)
				.json({ error: "'to' date must be after 'from' date" });
		}

		// Check for overlapping date ranges
		const overlap = await DrValue.findOne({
			$or: [
				{
					from: { $lte: toDate },
					to: { $gte: fromDate },
				},
			],
		});

		if (overlap) {
			return res
				.status(409)
				.json({ error: "Overlapping DR range exists" });
		}

		// Save new entry
		const newEntry = new DrValue({ from: fromDate, to: toDate, dr_value });
		await newEntry.save();

		res.status(201).json({ message: "DR value added", data: newEntry });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

router.get("/", async (req, res) => {
	try {
		const entries = await DrValue.find({})
			.sort({ from: -1 }) // most recent first
			.lean();

		const formatted = entries.map((entry) => ({
			_id: entry._id,
			from: formatDate(entry.from),
			to: formatDate(entry.to),
			dr_value: entry.dr_value,
		}));

		res.json(formatted);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch DR values" });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const { from, to, dr_value } = req.body;
		const { id } = req.params;

		if (!from || !to || dr_value === undefined) {
			return res.status(400).json({ error: "Missing fields" });
		}

		const fromDate = new Date(from);
		const toDate = new Date(to);

		if (toDate < fromDate) {
			return res
				.status(400)
				.json({ error: "'to' date must be after 'from' date" });
		}

		// Check if any other entry overlaps with the new date range
		const overlap = await DrValue.findOne({
			$and: [
				{ _id: { $ne: id } }, // Exclude the current document from the check
				{
					$or: [
						{
							from: { $lte: toDate },
							to: { $gte: fromDate },
						},
					],
				},
			],
		});

		if (overlap) {
			return res
				.status(409)
				.json({ error: "Overlapping DR range exists" });
		}

		// Update the entry
		const updatedEntry = await DrValue.findByIdAndUpdate(
			id,
			{ from: fromDate, to: toDate, dr_value },
			{ new: true },
		);

		if (!updatedEntry) {
			return res.status(404).json({ error: "Entry not found" });
		}

		res.json({
			message: "DR value updated successfully",
			data: {
				_id: updatedEntry._id,
				from: formatDate(updatedEntry.from),
				to: formatDate(updatedEntry.to),
				dr_value: updatedEntry.dr_value,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
