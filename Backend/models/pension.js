const mongoose = require("mongoose");

const defaultNumber = {
    type: Number,
    default: 0,
};

const PensionDetailsSchema = new mongoose.Schema(
    {
        PPoNo: { type: Number, ref: "Pensioner", required: true, unique: true },
        medi_allowance: defaultNumber,
        other_allowance: defaultNumber,
        other_deduction: defaultNumber,
        income_tax: defaultNumber,
        reduced_pension: defaultNumber,
    },
    {
        timestamps: true,
    },
);

const PensionDetails = mongoose.model("PensionDetails", PensionDetailsSchema);
module.exports = PensionDetails;
