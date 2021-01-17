require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const otp = require("otpgen")
const fast2sms = require("fast-two-sms")


router.post("/otpauth2" ,async(req,res) => {
    let hashotp = undefined
    let token1 = req.body.token1
    let token2 = req.body.token2
    let otp = req.body.otp
    try {
        hashotp = JWT.verify(token1,process.env.JWT_SECRET)
    }catch(e){
        res.render("misc_error" , {error: "Something Went Wrong maybe Token Expired" })
    }
    if(hashotp === undefined){
        res.render("misc_error" , {error: "Something Went Wrong" })
    }else{
        let result = await bcrypt.compareSync(otp.toString() , hashotp.SSDTOP)
        if(result){
            res.cookie('token', token2)
            res.redirect("/login/user")
        }else{
            res.render("error" , {error : "Token Expired or OTP is Wrong"})
        }
    }
})

module.exports = router