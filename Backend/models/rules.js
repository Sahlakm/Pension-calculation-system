const mongoose = require("mongoose");
const { type } = require("os");

const ruleSchema = mongoose.Schema(
	{
		ruleName: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		basic_pension: {
			type: Number,
			required: true,
			default: 0,
		},
		dp_a: {
			type: Number,
			required: true,
			default: 0,
		},
		employmentType: {
			type: String,
			enum: ["TEACHING", "NON_TEACHING"]
		},
		parameters: {
			type: Map,
			of: String,
			default: {},
		},
	},
	{ timestamps: true },
);

const Rule = mongoose.model("Rule", ruleSchema);
module.exports = Rule;
