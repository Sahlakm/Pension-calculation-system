const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { createPensionerFullView } = require("../models/createView"); // added
const {
	monthlySnapshotFrozenPensionerView,
	monthlySnapshotFrozenPensionerViewForce,
	dailySnapshotFrozenPensionerView,
	dailySnapshotFrozenPensionerViewForce,
} = require("../models/snapshotView"); // added

router.get("/full", (req, res) => {
	mongoose.connection.db
		.collection("pensioner_full_view")
		.find()
		.toArray()
		.then((data) => res.json(data))
		.catch((err) => {
			console.error("Error fetching pension view:", err);
			res.status(500).json({ error: "Failed to fetch data" });
		});
});

router.get("/take_monthly_snapshot", (req, res) => {
	monthlySnapshotFrozenPensionerView(mongoose.connection.db)
		.then((result) => res.send(result))
		.catch((err) => {
			console.error("Error fetching pension view:", err);
			res.status(500).json({ error: err });
		});
});

router.get("/take_monthly_snapshot_force", (req, res) => {
	monthlySnapshotFrozenPensionerViewForce(mongoose.connection.db)
		.then((result) => res.send(result))
		.catch((err) => {
			console.error("Error fetching pension view:", err);
			res.status(500).json({ error: err });
		});
});

router.get("/take_daily_snapshot", (req, res) => {
	dailySnapshotFrozenPensionerView(mongoose.connection.db)
		.then((result) => res.send(result))
		.catch((err) => {
			console.error("Error creating daily snapshot:", err);
			res.status(500).json({ error: err.message });
		});
});

router.get("/take_daily_snapshot_force", (req, res) => {
	dailySnapshotFrozenPensionerViewForce(mongoose.connection.db)
		.then((result) => res.send(result))
		.catch((err) => {
			console.error("Error creating forced daily snapshot:", err);
			res.status(500).json({ error: err.message });
		});
});

router.get("/monthly_snapshot_:mon_year", (req, res) => {
	const { mon_year } = req.params;
	const { pension_rule } = req.query;
	console.log(req.params, req.query);
	const snapshotName = mon_year;
	const filter = pension_rule ? { pension_rule: pension_rule } : {};

	mongoose.connection.db
		.collection(snapshotName)
		.find(filter)
		.toArray()
		.then((data) => {
			if (!data.length) {
				return res.status(404).json([]);
			}
			res.json(data);
		})
		.catch((err) => {
			console.error(`❌ Error fetching snapshot '${snapshotName}':`, err);
			res.status(500).json({ error: "Internal server error" });
		});
});

router.get("/monthly_snapshot/:email", async (req, res) => {
	const { email } = req.params;
	const db = mongoose.connection.db;

	try {
		const collections = await db.listCollections().toArray();

		// Filter collections with snapshot naming pattern
		const snapshotCollections = collections
			.map((col) => col.name)
			.filter((name) => /^[a-z]{3}_\d{4}$/.test(email));

		const results = [];

		for (const collName of snapshotCollections) {
			const collection = db.collection(collName);
			const entries = await collection
				.find({ PPoNo: Number(ppono) })
				.toArray();

			if (entries.length > 0) {
				results.push(
					...entries.map((entry) => ({
						...entry,
						snapshot: collName,
					})),
				);
			}
		}

		// Sort snapshots chronologically (e.g. jan_2024 < feb_2024 < jan_2025)
		const monthOrder = {
			jan: 1,
			feb: 2,
			mar: 3,
			apr: 4,
			may: 5,
			jun: 6,
			jul: 7,
			aug: 8,
			sep: 9,
			oct: 10,
			nov: 11,
			dec: 12,
		};

		results.sort((a, b) => {
			const [am, ay] = a.snapshot.split("_");
			const [bm, by] = b.snapshot.split("_");
			return ay - by || monthOrder[am] - monthOrder[bm];
		});

		res.json(results);
	} catch (err) {
		console.error("Error fetching snapshot data:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.get("/daily_snapshot_:date", (req, res) => {
	const { date } = req.params; // expected format: dd_mm_yyyy
	console.log(date);
	const { pension_rule, pension_status, employment_type } = req.query;

	console.log("Params:", req.params, "Query:", req.query);

	const snapshotName = "daily_" + date;
	const filter = {};

	if (pension_rule) filter.pension_rule = pension_rule;
	if (pension_status) filter.pension_status = pension_status;
	if (employment_type) filter.employmentType = employment_type;

	mongoose.connection.db
		.collection(snapshotName)
		.find(filter)
		.toArray()
		.then((data) => {
			if (!data.length) {
				return res.status(404).json([]);
			}
			res.json(data);
		})
		.catch((err) => {
			console.error(`❌ Error fetching snapshot '${snapshotName}':`, err);
			res.status(500).json({ error: "Internal server error" });
		});
});

router.get("/daily_snapshot/:email", async (req, res) => {
	const { email } = req.params;
	console.log(email);
	const db = mongoose.connection.db;

	try {
		const collections = await db.listCollections().toArray();

		// Match daily snapshots using regex dd_mm_yyyy
		const snapshotCollections = collections
			.map((col) => col.name)
			.filter((email) => /^daily_\d{2}_[a-z]{3}_\d{4}$/.test(email));

		const results = [];

		for (const collName of snapshotCollections) {
			const collection = db.collection(collName);
			const entries = await collection
				// .find({ PPoNo: Number(ppono) })
				.find({ email })
				.toArray();

			if (entries.length > 0) {
				results.push(
					...entries.map((entry) => ({
						...entry,
						snapshot: collName,
					})),
				);
			}
		}

		// Sort by date (convert dd_mm_yyyy to real Date object)
		results.sort((a, b) => {
			const parseDate = (str) => {
				const [dd, mm, yyyy] = str.split("_").map(Number);
				return new Date(yyyy, mm - 1, dd);
			};
			return parseDate(a.snapshot) - parseDate(b.snapshot);
		});

		res.json(results);
	} catch (err) {
		console.error("Error fetching daily snapshots:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
