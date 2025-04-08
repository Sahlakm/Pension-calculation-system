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

function snapshotFrozenPensionerView(db) {
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

module.exports = { snapshotFrozenPensionerView };
