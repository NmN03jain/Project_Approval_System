const express = require("express");
const session = require("express-session");
const admin_r = express();
const config = require("../config/config")
const bodyParser = require("body-parser")
admin_r.use(bodyParser.json())
admin_r.use(bodyParser.urlencoded({extended:true}))
admin_r.set("view engine","ejs")
admin_r.set("views","./views/admin")
// admin_r.set("view")
admin_r.use(session({secret:config.sessionSecret}))
const student = require("../model/student")
const Notes = require("../model/notes")
admin_r.get("/",(req,res)=>{
    res.render("admin_login")
})
const bcrypt = require("bcryptjs")

admin_r.post("/",async(req,res)=>{

    try {
    const email  = req.body.email; 
    const password = req.body.password;
    
    const data = await student.findOne({email:email})
    const isMatch = await bcrypt.compare(password, data.password)
    if(data){
            if(isMatch){
                if(data.is_admin===0){
                    console.log("mistake2")
                    res.render("admin_login",{message:"Invalid email and password"})
                }
                else{
                    req.session.user_id = data._id
                    res.redirect("/admin/mainAdmin")
                    // res.render("mainAdmin")
                }
            }
            else{
                console.log("mistake1")
                res.render("admin_login",{message:"Invalid email and password"})
            }
    }else{
        console.log("mistake")
        res.render("admin_login",{message:"Invalid email and password"})
    }
    
} catch (error) {
    res.render("admin_login",{message:"Invalid email and password"})
 console.log("mistake found")       
}

})




admin_r.get("/mainAdmin", (req, res) => {
    const id = req.params.id;
    Notes.find().exec((err, users) => {
        if (err) {
            res.json({ message: err.message })
        }
        else {
            if (id === users.id) {

                res.render("mainAdmin", {
                    title: "main page",
                    users: users,
                })
            }
            else {
                console.log("not found")
            }
        }
    })
})
admin_r.get("/mainAdmin",(req,res)=>{
    res.render("mainAdmin")
})


admin_r.get("/logout",(req,res)=>{
    try {
        req.session.destroy()
        res.redirect("/index2")
        // res.render("index")
    } catch (error) {
        console.log(error)
    }
})
module.exports= admin_r;



