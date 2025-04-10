const monthMap = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];

function monthlySnapshotFrozenPensionerView(db) {
	const now = new Date();
	const month = monthMap[now.getMonth()];
	const year = now.getFullYear();
	const snapshotName = `${month}_${year}`;

	const source = db.collection("pensioner_full_view");
	const target = db.collection(snapshotName);

	return source
		.find()
		.toArray()
		.then((data) => {
			if (!data.length) throw new Error("No data in pensioner_full_view");
			return db
				.listCollections({ name: snapshotName })
				.toArray()
				.then((existing) => {
					const ensureFresh =
						existing.length > 0
							? target.deleteMany({}) // Clear if exists
							: db.createCollection(snapshotName); // Create if not

					return ensureFresh.then(() => target.insertMany(data));
				});
		})
		.then(() => {
			// Freeze the snapshot to make it read-only
			return db.command({
				collMod: snapshotName,
				validator: { $expr: { $eq: [1, 0] } }, // always false
				validationAction: "error",
			});
		})
		.then(() => {
			// Return snapshot data
			return target.find().toArray();
		})
		.catch((err) => {
			console.error("❌ Snapshot creation error:", err);
			throw err;
		});
}

function monthlySnapshotFrozenPensionerViewForce(db) {
	const now = new Date();
	const month = monthMap[now.getMonth()];
	const year = now.getFullYear();
	const snapshotName = `${month}_${year}`;

	const source = db.collection("pensioner_full_view");

	return db
		.listCollections({ name: snapshotName })
		.toArray()
		.then((existing) => {
			if (existing.length > 0) {
				console.log(
					`⚠️ Snapshot '${snapshotName}' exists, deleting...`,
				);
				return db.collection(snapshotName).drop();
			}
		})
		.then(() => source.find().toArray())
		.then((data) => {
			if (!data.length) throw new Error("No data in pensioner_full_view");

			return db
				.createCollection(snapshotName)
				.then(() => db.collection(snapshotName).insertMany(data));
		})
		.then(() => {
			// Freeze the snapshot to make it read-only
			return db.command({
				collMod: snapshotName,
				validator: { $expr: { $eq: [1, 0] } }, // always false
				validationAction: "error",
			});
		})
		.then(() => {
			console.log(
				`📸 Forced snapshot '${snapshotName}' created and frozen.`,
			);
			return db.collection(snapshotName).find().toArray();
		})
		.catch((err) => {
			console.error("❌ Forced snapshot creation error:", err);
			throw err;
		});
}

function dailySnapshotFrozenPensionerView(db) {
	const now = new Date();
	const month = monthMap[now.getMonth()];
	const day = now.getDate().toString().padStart(2, "0");
	const year = now.getFullYear();
	const snapshotName = `daily_${day}_${month}_${year}`;

	const source = db.collection("pensioner_full_view");
	const target = db.collection(snapshotName);

	return source
		.find()
		.toArray()
		.then((data) => {
			if (!data.length) throw new Error("No data in pensioner_full_view");
			return db
				.listCollections({ name: snapshotName })
				.toArray()
				.then((existing) => {
					const ensureFresh =
						existing.length > 0
							? target.deleteMany({}) // Clear if exists
							: db.createCollection(snapshotName); // Create if not

					return ensureFresh.then(() => target.insertMany(data));
				});
		})
		.then(() => {
			// Freeze the snapshot to make it read-only
			return db.command({
				collMod: snapshotName,
				validator: { $expr: { $eq: [1, 0] } }, // always false
				validationAction: "error",
			});
		})
		.then(() => {
			console.log(
				`📸 Daily snapshot '${snapshotName}' created and frozen.`,
			);
			return target.find().toArray();
		})
		.catch((err) => {
			console.error("❌ Daily snapshot creation error:", err);
			throw err;
		});
}

function dailySnapshotFrozenPensionerViewForce(db) {
	const now = new Date();
	const month = monthMap[now.getMonth()];
	const day = now.getDate().toString().padStart(2, "0");
	const year = now.getFullYear();
	const snapshotName = `daily_${day}_${month}_${year}`;

	const source = db.collection("pensioner_full_view");

	return db
		.listCollections({ name: snapshotName })
		.toArray()
		.then((existing) => {
			if (existing.length > 0) {
				console.log(
					`⚠️ Snapshot '${snapshotName}' exists. Deleting...`,
				);
				return db.collection(snapshotName).drop();
			}
		})
		.then(() => source.find().toArray())
		.then((data) => {
			if (!data.length) throw new Error("No data in pensioner_full_view");

			return db
				.createCollection(snapshotName)
				.then(() => db.collection(snapshotName).insertMany(data));
		})
		.then(() => {
			// Freeze the snapshot to make it read-only
			return db.command({
				collMod: snapshotName,
				validator: { $expr: { $eq: [1, 0] } }, // always false
				validationAction: "error",
			});
		})
		.then(() => {
			console.log(
				`📸 Forced daily snapshot '${snapshotName}' created and frozen.`,
			);
			return db.collection(snapshotName).find().toArray();
		})
		.catch((err) => {
			console.error("❌ Forced daily snapshot creation error:", err);
			throw err;
		});
}

module.exports = {
	monthlySnapshotFrozenPensionerView,
	monthlySnapshotFrozenPensionerViewForce,
	dailySnapshotFrozenPensionerView,
	dailySnapshotFrozenPensionerViewForce,
};
