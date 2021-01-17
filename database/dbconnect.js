require("dotenv").config()
const mongoose = require("mongoose")
const uri = `mongodb://Vishnu_Sai:${process.env.DBPASSWORD}@cluster0-shard-00-00.hkghe.mongodb.net:27017,cluster0-shard-00-01.hkghe.mongodb.net:27017,cluster0-shard-00-02.hkghe.mongodb.net:27017/${process.env.DBNAME}?ssl=true&replicaSet=atlas-wy6h87-shard-0&authSource=admin&retryWrites=true&w=majority`
// const uri = 'mongodb://localhost:27017/test-2'

const connect = mongoose.connect(uri, { useUnifiedTopology: true, useFindAndModify: true, useNewUrlParser: true })
const userSchema = mongoose.Schema({
    email: String,
    password: String,
    username: String,
    phoneNumber : Number,
    istwofa : Boolean,
    isAuthenticated: Boolean
})
const userModel = new mongoose.model("users", userSchema)
module.exports = userModel