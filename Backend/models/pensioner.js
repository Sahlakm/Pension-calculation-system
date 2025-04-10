const mongoose = require("mongoose");

const trimString = { type: String, trim: true };
// const defaultNumber = { type: Number, default: 0 };

const PensionerSchema = new mongoose.Schema(
    {
        PPoNo: { 
            type: Number, 
            required: [true, 'PPO number is required'],
            unique: true,
            
        },
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
        email: {
            type: trimString,
            required: true
        },
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




const Pensioner = mongoose.model("Pensioner", PensionerSchema);



module.exports = Pensioner;
