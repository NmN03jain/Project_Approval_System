const express = require('express')
const app = express()
const session = require("express-session")
const port = process.env.PORT || 3000
const path = require("path")
const bcrypt = require("bcryptjs")
require("./db/connect")
const Student = require("./model/student")
const Notes = require("./model/notes")
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
const config = require("./config/config")
app.use(session({secret:config.sessionSecret}))
// const auth = require("./middleware/auth")
app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false,
    })
)
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
})

const multer = require("multer")
const fs = require("fs")
const alert = require("alert-node")
const { Session } = require('inspector')
app.set('view engine', 'ejs')


const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path))
app.use(express.static("upload"))

const admin = require("./routes/admin")
app.use("/admin",admin)

app.get("/", (req, res) => {
    res.render('index')
})

app.get("/index2", (req, res) => {
    res.render("index2", { title: "index2" })
})

// 1 Api fo sign up 
app.post('/register', async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password;
        const cpassword = req.body.confirmpassword
        if (password === cpassword) {

            const user = new Student({
                username: req.body.username,
                email: req.body.email,
                number: req.body.number,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                is_admin: 0
            });
            const saving = await user.save();
            res.status(201).render("index2")
        }
        else {
            // console.log("Passwrod is not matching");
            res.send("pssswrod is not matching")
        }


    } catch (error) {
        res.status(404).send(error)
    }
})

// 2 api for login function
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email
        const passwrod = req.body.password

        const useremail = await Student.findOne({ email: email })

        const isMatch = await bcrypt.compare(passwrod, useremail.password)

        if (isMatch) {

            if(useremail.is_admin==0){     
                // res.status(201).redirect("main.html")
                // res.render('main')
                req.session.user_id=  useremail._id
                res.redirect("/main")
            }
            else{
                res.render("index2")
                alert("Invalid-Credentials")
            }
        }
        else {
            res.render("index2")
            alert("Invalid-Credentials")
            // res.send(" <h1> ma'am its invalid credentials </h1>")
        }
    } catch (error) {
        res.render("index2")
        alert("Invalid-Credentials")
        // (res.status(404).send("invalid credentials !"))

    }
})
// app.get("/main",auth.is_login,(req,res)=>{
//     res.render("main")
// })

// fetching notes




const storage = multer.diskStorage({
    destination: "upload",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage }).single('image');


app.post("/main", upload, (req, res) => {

    try {

        const namefile = req.file.filename
        const note = new Notes({
            title: req.body.title,
            description: req.body.description,
            image: namefile
        })
        note.save((err) => {
            if (err) {
                res.json({ message: err.message, type: "danger" })
            }
            else {
                req.session.message = {
                    type: 'succes',
                    message: "Added Succesfully"
                }
                res.redirect("/main")
                // res.render("main")
            }
        })

        // note.save().then((res)=>{
        //     console.log("image is saved")
        // }).catch((err)=>{
        //     console.log("image is not saved")
        // })
        // res.render("main")

    } catch (error) {
        alert("choose a File !!!!!!")
        res.render("main")
    }
})

app.get("/main", (req, res) => {
    const id = req.params.id;
    Notes.find().exec((err, users) => {
        if (err) {
            res.json({ message: err.message })
        }
        else {
            if (id === users.id) {

                res.render("main", {
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

app.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    Notes.findById(id, (err, user) => {
        if (err) {
            res.redirect("/main")
        }
        else {
            if (user == null) {
                res.redirect("/main")
            }
            else {
                res.render("edit", {
                    title: "edit user",
                    user: user,
                })
            }
        }
    })
})

app.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = ''
    if (req.file) {
        new_image = req.file.filename
        try {
            fs.unlinkSync("./upload/" + req.body.old_image)
        }
        catch (err) {
            console.log(err)
        }
    }
    else {
        new_image = req.body.old_image
    }
    Notes.findByIdAndUpdate(id, {
        title: req.body.title,
        description: req.body.description,
        image: new_image
    }, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            req.session.message = {
                type: "success",
                message: "updated successfully"
            }
            res.redirect("/main")
        }
    })

})

app.get("/delete/:id", (req, res) => {
    let id = req.params.id;
    Notes.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync("./upload/" + result.image)
            } catch (error) {
                console.log(error)
            }
        }

        if (err) {
            res.json({
                message: err.message
            })
        }
        else {
            res.redirect("/main")
        }

    })
})


app.listen(port, () => {
    console.log(`app listening on port ${port}!`)
})
