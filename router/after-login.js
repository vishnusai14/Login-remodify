require("dotenv").config()
const express = require("express")
const model = require("../database/dbconnect")
const JWT = require("jsonwebtoken")

const Router = express.Router()


Router.get("/login/user", (req, res) => {
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
        model.findOne({ _id: user.id }, (err, found) => {
            if (err) {
                console.log(err)
            }
            if (found) {
                res.render("afterlogin", { userName: found.username })
            } else {
                console.log("No Found")
            }
        })
    }
    }
})


Router.get("/login/user/logout", (req, res) => {
    console.log("LOGOUT")
    res.clearCookie('token')
    res.redirect("/")
})


module.exports = Router