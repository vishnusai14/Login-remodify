require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const otp = require("otpgen")
const fast2sms = require("fast-two-sms")
router.get("/twofa" , (req,res) => {
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
        model.findOne({_id : user.id} , (err,found) => {
            if(found.istwofa){
                res.render("misc_error" , {error : "You Have Already Enabled Two Factor Authentication"} )
            }else{
                res.render("twofa")
            }
            })
        
        }
    }

})
router.post("/twofa" , async(req,res) => {
    let phoneNumber = req.body.tel
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
            otp.getOTP(4 , async(data) => {
                TOTP = data.otp
                let msg =  `Your OTP is ${TOTP} . It is Valid For Five Minutes` 
                let options = {authorization : process.env.FASTSMS , message : msg  , numbers : [phoneNumber]}
                fast2sms.sendMessage(options)
                model.updateOne({_id : user.id} , {phoneNumber : phoneNumber} , (err,response) => {
                    if(err){
                        console.log(err)
                    }else{
                        console.log(response)
                    }
                })
                let hashotp = await bcrypt.hash(TOTP.toString() , 2)
                let otptoken = JWT.sign({SSDTOP : hashotp} , process.env.JWT_SECRET , {expiresIn : "5m"})
                res.render("otp" , {token : otptoken})
            })
        }else{
            res.render("error" , {error : "Something WENT Wrong"})
        }
    }
    
})



module.exports = router