const mongoose = require("mongoose");

const drValueSchema = new mongoose.Schema({
	from: {
		type: Date,
		required: true,
	},
	to: {
		type: Date,
		required: true,
	},
	dr_value: {
		type: Number,
		required: true,
		default: 0,
	},
});

DrValue = mongoose.model("drvalue", drValueSchema);
module.exports = {DrValue}