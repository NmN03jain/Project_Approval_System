const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const studentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                console.log("invalid");
            }
        }
    },
    number: {
        type: Number,
        required: true,
        unique: true,
        min: 10,

    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true 
    },
    is_admin:{
        type:Number,
        required:true
    },
})

studentSchema.pre("save", async function(next){
    this.password = await bcrypt.hash(this.password, 10)
    this.confirmpassword = undefined
    next();
})

const Student = new mongoose.model("Student", studentSchema)
module.exports = Student