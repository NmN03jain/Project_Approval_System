const is_login= async(req,res,next)=>{
    try {

        if(req.session.user_id){

        }else{
            res.redirect("/index2")
            // res.redirect("/main")
        }
        next()

    } catch (error) {
        console.log(error.message)
    }
}

const is_logout= async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect("/main")
            // res.redirect("/index2")
        }
        next();
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    is_login,
    is_logout
}