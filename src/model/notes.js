const mongoose = require("mongoose");


const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        requried: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        type: String,
    }
})

const Notes = new mongoose.model("Note", notesSchema)
module.exports = Notes
