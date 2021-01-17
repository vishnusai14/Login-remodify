require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")



router.get("/changepassword" , (req,res) => {
    let cookie_index = undefined
    try{
     cookie_index = req.headers['cookie'].search("CH_SSID")
    }catch(err){
        res.redirect('/')
    }
    if(cookie_index !== undefined){
        let token = req.headers['cookie'].slice(cookie_index, req.headers['cookie'].length)
        let token_value = token.slice(8, token.length)
        res.render("changepassword.ejs")
    }
    

})

router.post("/changepasswordin" , async(req,res) => {
    let newpassword = req.body.password
    let hashPassword = await bcrypt.hash(newpassword, 15)
    let user = undefined
    let cookie_index = req.headers['cookie'].search("CH_SSID")
    let token = req.headers['cookie'].slice(cookie_index, req.headers['cookie'].length)
    let token_value = token.slice(8, token.length)
    try{
        user = JWT.verify(token_value , process.env.JWT_SECRET)
    }catch(err){
        res.render("error" , {error : "Token Expired"})
    }
    if(user == undefined){
        res.render("error" , {error : "Something Went Wrong"})
    }else{
        model.updateOne({_id : user.id} , {password : hashPassword} ,(err,result)=>{
            if(err){
                console.log(err)
            }else{
                console.log(result)
                res.clearCookie('CH_SSID')
                res.clearCookie('token')
                res.redirect("/")
            }
        })
    }
})

module.exports  = router