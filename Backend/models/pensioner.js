const mongoose = require("mongoose");

const trimString = { type: String, trim: true };
// const defaultNumber = { type: Number, default: 0 };

const PensionerSchema = new mongoose.Schema(
    {
        PPoNo: { type: Number, required: true, unique: true },
        name: trimString,
        pension_rule: {
            type: String,
            // enum: [
            //     "SIXTH PAY NON-TEACHING STAFF (STATE)",
            //     "SEVENTH PAY NON-TEACHING STAFF (STATE)",
            //     "SIXTH PAY TEACHING STAFF",
            //     "SEVENTH PAY TEACHING STAFF (CENTRAL)",
            // ],
            trim: true,
        }, // Add valid rules here
        pension_status: {
            type: String,
            enum: ["SERVICE PENSION", "FAMILY PENSION", "LEGAL HEIR"],
            trim: true,
        },
        email: trimString,
        phone_number: trimString,
        alternate_phone_number: trimString,
        adhaar_number: trimString,
        address: {
            line1: trimString,
            line2: trimString,
            line3: trimString,
            pincode: { type: Number, min: 100000, max: 999999 },
        },
        family_member: {
            name: trimString,
            relation: trimString,
            isEmployed: Boolean,
        },
        bank: {
            account_number: { type: Number, required: true },
            ifsc_code: trimString,
            address: trimString,
        },
        date_of_birth: Date,
        date_of_joining: Date,
        date_of_retirement: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);



// const DrValuesSchema = new mongoose.Schema({
//     from: Date,
//     to: Date,
//     dr_value: Number,
// });


// // Update PensionDetails when DrValues changes
// DrValuesSchema.post("save", async function () {
//     const pensionDetails = await mongoose.model("PensionDetails").find();
//     for (let pension of pensionDetails) {
//         await pension.save(); // Trigger recalculation of virtual fields
//     }
// });

// Function to take monthly snapshot of PensionDetails
// async function createMonthlySnapshot() {
//     const now = new Date();
//     const month = now
//         .toLocaleString("default", { month: "long" })
//         .toLowerCase();
//     const year = now.getFullYear();
//     const snapshotModelName = `${month}_${year}_pension`;

//     const SnapshotSchema = new mongoose.Schema(
//         {
//             PPoNo: Number,
//             basic: Number,
//             dp_a: Number,
//             medi_allowance: Number,
//             other_allowance: Number,
//             other_deduction: Number,
//             income_tax: Number,
//             total: Number,
//             reduced_pension: Number,
//             dr: Number,
//             total_pension: Number,
//             net_pay: Number,
//             month: String,
//             year: Number,
//             date_of_snapshot: { type: Date, default: Date.now },
//             bank: {
//                 account_number: { type: Number, required: true },
//                 ifsc_code: trimString,
//                 address: trimString,
//             },
//             pension_rule: trimString, // Adding pension_rule to snapshot
//         },
//         { timestamps: true },
//     );

//     const SnapshotModel = mongoose.model(snapshotModelName, SnapshotSchema);
//     const pensionDetails = await mongoose.model("PensionDetails").find();

//     const snapshotData = await Promise.all(
//         pensionDetails.map(async (pension) => {
//             const pensioner = await mongoose
//                 .model("Pensioner")
//                 .findOne({ PPoNo: pension.PPoNo });
//             return {
//                 PPoNo: pension.PPoNo,
//                 basic: pension.basic,
//                 dp_a: pension.dp_a,
//                 medi_allowance: pension.medi_allowance,
//                 other_allowance: pension.other_allowance,
//                 other_deduction: pension.other_deduction,
//                 income_tax: pension.income_tax,
//                 total: pension.total,
//                 reduced_pension: pension.reduced_pension,
//                 dr: await pension.dr,
//                 total_pension: await pension.total_pension,
//                 net_pay: await pension.net_pay,
//                 month: month,
//                 year: year,
//                 date_of_snapshot: new Date(),
//                 bank: pensioner ? pensioner.bank : null, // Include bank details
//                 pension_rule: pensioner ? pensioner.pension_rule : null, // Include pension_rule
//             };
//         }),
//     );

//     await SnapshotModel.insertMany(snapshotData);
//     console.log(`Snapshot for ${month} ${year} saved.`);
// }

const Pensioner = mongoose.model("Pensioner", PensionerSchema);

// const DrValues = mongoose.model("DrValues", DrValuesSchema);

module.exports = Pensioner;
