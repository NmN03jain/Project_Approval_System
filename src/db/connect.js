const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/Student-registration")
.then(()=>{
    console.log("Mongodb is connected succesfully ")
}).catch((e)=>{
    console.log("Error found in mongodb");
})
