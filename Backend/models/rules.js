const mongoose = require('mongoose');

const ruleSchema = mongoose.Schema({
    ruleName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    parameters: {
        type: Map,
        of: String,
        default: {}
    }
}, { timestamps: true });

// Model name should be singular and capitalized (convention)
const Rule = mongoose.model("Rule", ruleSchema);

module.exports = Rule;