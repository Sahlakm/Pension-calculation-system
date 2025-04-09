const Rule = require("../models/rules");

// Create a new rule
exports.createRule = async (req, res) => {
	try {
		const {
			ruleName,
			description,
			isActive,
			parameters,
			basic_pension,
			employmentType,
			dp_a,
		} = req.body;

		console.log(req.body);

		const newRule = new Rule({
			ruleName,
			description,
			isActive,
			employmentType,
			parameters,
			basic_pension,
			dp_a,
		});

		const savedRule = await newRule.save();
		res.status(201).json(savedRule);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Get all rules
exports.getAllRules = async (req, res) => {
	try {
		// console.log("In rules ");
		const rules = await Rule.find().sort({ createdAt: -1 });
		res.status(200).json(rules);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get single rule
exports.getRule = async (req, res) => {
	try {
		const rule = await Rule.findById(req.params.id);
		if (!rule) {
			return res.status(404).json({ message: "Rule not found" });
		}
		res.status(200).json(rule);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update rule
exports.updateRule = async (req, res) => {
	try {
		const { ruleName, description, isActive, parameters } = req.body;

		const updatedRule = await Rule.findByIdAndUpdate(
			req.params.id,
			{
				ruleName,
				description,
				isActive,
				parameters,
			},
			{ new: true, runValidators: true },
		);

		if (!updatedRule) {
			return res.status(404).json({ message: "Rule not found" });
		}

		res.status(200).json(updatedRule);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Delete rule
exports.deleteRule = async (req, res) => {
	try {
		const deletedRule = await Rule.findByIdAndDelete(req.params.id);

		if (!deletedRule) {
			return res.status(404).json({ message: "Rule not found" });
		}

		res.status(200).json({ message: "Rule deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
