require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const otp = require("otpgen")
const fast2sms = require("fast-two-sms")

router.post("/twofa/otp" , async(req,res) => {
    let user = undefined
    if (req.headers['cookie'] === undefined) {
        res.redirect('/')
    } else {
        let cookie_index = req.headers['cookie'].search("token")
        let token = req.headers['cookie'].slice(cookie_index, req.headers['cookie'].length)
        let token_value = token.slice(6, token.length)
        try{
             user = JWT.verify(token_value, process.env.JWT_SECRET)
        }catch(err){
            res.redirect('/')
        }
        if(user){
            let hashotp = undefined
            token_value = req.body.token
            token = token_value.toString()
            try{
                hashotp = JWT.verify(token, process.env.JWT_SECRET)
                
           }catch(err){
               res.render("error" , {error : "Token Expired"})
           }
           let otp = req.body.otp
           let result = await bcrypt.compareSync(otp.toString() , hashotp.SSDTOP)
           if(result){
               res.render("error" , {error : "Two Factor Authenticaiton is Enabled . Please get Back To Home Page"})
               model.updateOne({_id : user.id} , {istwofa : true} , (err , msg) => {
                if(err){
                    console.log(err)
                }else{
                    console.log(msg)
                }
            })

           }else{
               res.render("error" , {error : "OTP is Incorrect. Please Try Again"})
               model.updateOne({_id : user.id} , {phoneNumber : 0 , istwofa : false} , (err , msg) => {
                   if(err){
                       console.log(err)
                   }else{
                       console.log(msg)
                   }
               })
           }
        }else{
            res.render("error" , {error : "Somthing Went Wrong"})
        }
    }
    
})

module.exports = router