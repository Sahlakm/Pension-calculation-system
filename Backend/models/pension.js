
const mongoose = require("mongoose");

const trimString = { type: String, trim: true };
const defaultNumber = { type: Number, default: 0 };



const PensionDetailsSchema = new mongoose.Schema(
    {
        PPoNo: { type: Number, ref: "Pensioner", required: true, unique: true },
        basic: defaultNumber,
        dp_a: defaultNumber,
        medi_allowance: defaultNumber,
        other_allowance: defaultNumber,
        other_deduction: defaultNumber,
        income_tax: defaultNumber,
        dr: defaultNumber, // Store computed dr value
        total: defaultNumber,
        reduced_pension: defaultNumber,
        total_pension: defaultNumber,
        net_pay: defaultNumber,
    },
    {
        timestamps: true,
    },
);


PensionDetailsSchema.pre("save", async function (next) {
    this.dp_a = this.dp_a !== "" ? this.dp_a : 0;
    this.total = this.basic + this.dp_a;
    this.reduced_pension = this.total;
    this.income_tax = this.income_tax ? this.income_tax : 0;
    this.other_deduction = this.other_deduction ? this.other_deduction : 0
    this.other_allowance = this.other_allowance ? this.other_allowance : 0;

    const today = new Date();
    const drEntry = await mongoose
        .model("DrValues")
        .findOne({ from: { $lte: today }, to: { $gte: today } });
    this.dr = drEntry ? drEntry.dr_value : 0;

    this.total_pension =
        this.reduced_pension +
        this.dr +
        this.medi_allowance +
        this.other_allowance;
    this.net_pay = this.total_pension + this.other_deduction + this.income_tax;

    next();
});


var PensionDetails = mongoose.model("PensionDetails", PensionDetailsSchema);

const DrValuesSchema = new mongoose.Schema({
    from: Date,
    to: Date,
    dr_value: Number,
});

// Update PensionDetails when DrValues changes
DrValuesSchema.post("save", async function () {
    const pensionDetails = await mongoose.model("PensionDetails").find();
    for (let pension of pensionDetails) {
        await pension.save(); // Trigger recalculation of virtual fields
    }
});



const DrValues = mongoose.model("DrValues", DrValuesSchema);

module.exports={PensionDetails, DrValues};
// export default {PensionDetails, DrValues}


