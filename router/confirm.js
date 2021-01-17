require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const router = express.Router()
const JWT = require("jsonwebtoken")


router.get("/confirmation/login/:token", (req, res) => {
    let user = undefined
    let token = req.params.token
    try{
        user = JWT.verify(token , process.env.JWT_SECRET)
    }catch(err){
        res.render("error" , {error : "Token Expired"})
    }if(user){
    model.updateOne({ _id: user.id }, { isAuthenticated: true }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result)
        }
    })
    res.redirect("/")
    }
})

module.exports = router