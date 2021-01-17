require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const JWT = require("jsonwebtoken")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

router.get("/confirmemailforpassword" , (req,res) => {
    res.render("confirmemailforpasswordchange")
})



router.post("/confirmemailforpassword" , (req,res)=>{
    let email = req.body.email
    model.findOne({email : email} , (err , found) => {
        if(err){
            console.log(err)
        }else{
            if(found){
                let token = JWT.sign({id : found._id} , process.env.JWT_SECRET , {expiresIn : '10m'})
                let url = `https://${req.headers.host}/changepassword/${token}` 
                let mailOptions = {
                    from: process.env.GMAIL,
                    to: email,
                    subject: 'Change Your Password',
                    html: `<h3>This Link Will Expire In Ten Minute</h3><br /><a href = ${url}>${url}</a>`
                }
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        res.render("error", { error: "Please Check Your Mail For Confirmation Link" })
                    }
                })
            }else{
                res.render("error" , {error : "No User Found"})
            }
        }
    })
})

module.exports = router