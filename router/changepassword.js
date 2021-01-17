require("dotenv").config()
const express = require("express")
const router = express.Router()
const JWT = require("jsonwebtoken")


router.get("/changepassword/:token" , (req,res)=>{
    let user = undefined
    let token = req.params.token
    try{
        user = JWT.verify(token , process.env.JWT_SECRET)
    }catch(err){
        res.render("error" , {error : "Token Expired"})
    }
    if(user == undefined){
        console.log("No User")
    }else{
        res.cookie("CH_SSID" , token)
        res.redirect('/changepassword')
    }
    // res.cookie('SSIDCHANGE_WE23' , req.params.token)
    // res.render("changepassword.ejs")
})




module.exports = router