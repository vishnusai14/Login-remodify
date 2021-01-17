require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const otp = require("otpgen")
const fast2sms = require("fast-two-sms")
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

router.get("/", (req, res) => {
    res.clearCookie('token')
    res.render("login")
})

router.get("/signup", (req, res) => {
    res.clearCookie('token')
    res.render("signup")
})


router.post("/login", async(req, res) => {
    let email = req.body.email
    let password = req.body.password
    model.findOne({ email: email }, (err, found) => {
        if (err) {
            console.log(err)
        } else {
            if (found) {
                let result =  bcrypt.compareSync(password, found.password)
                if (result) {
                    if (found.isAuthenticated) {
                        if(found.istwofa){
                            otp.getOTP(4 , async(data) => {
                                TOTP = data.otp
                                let msg =  `Your OTP is ${TOTP} . It is Valid For Five Minutes` 
                                let options = {authorization : process.env.FASTSMS , message : msg  , numbers : [found.phoneNumber]}
                                fast2sms.sendMessage(options)
                                let hashotp = await bcrypt.hash(TOTP.toString() , 2)
                                let otptoken = JWT.sign({SSDTOP : hashotp} , process.env.JWT_SECRET , {expiresIn : "5m"})
                                let token_auth2 = JWT.sign({ username: found.username, id: found._id }, process.env.JWT_SECRET)
                                res.render("otp-auth2" , {token1 : otptoken , token2 : token_auth2}) 
                            })
                        }else{
                            let token = JWT.sign({ username: found.username, id: found._id }, process.env.JWT_SECRET)
                            res.cookie('token', token)
                            res.redirect("/login/user")
                        }
                    } else {
                        res.render("error", { error: "Confirm Your Account" })
                    }
                } else {
                    res.render("error", { error: "Please Check Your Username and Password" })
                }
            } else {
                res.render("error", { error: "Please Check Your Username and Password" })
            }
        }
    })
})


router.post("/signup", async(req, res) => {

    let email = req.body.email
    let plain_password = req.body.password
    let username = req.body.username

    let hashPassword = await bcrypt.hash(plain_password, 5)
    let newUser = new model({
        email: email,
        password: hashPassword,
        username: username,
        phoneNumber : 0,
        istwofa : false,
        isAuthenticated: false
    })
    model.findOne({ email: email }, (err, found) => {
        if (err) {
            console.log(err)
        } else {
            if (found) {
                res.render("error", { error: "User Exist" })
            } else {
                newUser.save((err, user) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Success")
                        let tokenSignUp = JWT.sign({ id: user._id }, process.env.JWT_SECRET , {expiresIn : '10m'})
                        url = `https://${req.headers.host}/confirmation/login/${tokenSignUp}`
                        let mailOptions = {
                            from: process.env.GMAIL,
                            to: email,
                            subject: 'Link To Verify',
                            html: `<h3>This Link Will Expire In Ten Minutes</h3><br /><a href = ${url}>${url}</a>`
                        }
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                                res.render("error", { error: "Please Check Your Mail For Confirmation Link" })
                            }
                        })

                    }
                })
            }
        }
    })

})


module.exports = router