const express = require("express")
const app = express()
    // const database = require("./database/dbconnect")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
    // database.connnect
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())
PORT = process.env.PORT || 3000


app.set("view engine", "ejs")

app.get("/", require("./router/index"))
app.get("/signup", require("./router/index"))
app.get('/logout', require("./router/logout"))
app.get("/login/user", require("./router/after-login"))
app.get("/confirmation/login/:token", require("./router/confirm"))
app.get("/confirmemailforpassword" , require("./router/confirmemailforpassword"))
app.get("/changepassword/:token" , require("./router/changepassword"))
app.get('/twofa' , require("./router/twofa"))
app.get('/changepassword' ,  require("./router/change") )
app.post("/login", require("./router/index"))
app.post("/signup", require("./router/index"))
app.post("/confirmemailforpassword",require("./router/confirmemailforpassword"))
app.post("/changepasswordin" , require("./router/change"))
app.post('/twofa' , require("./router/twofa"))
app.post("/twofa/otp" , require("./router/checkotp"))
app.post("/otpauth2" , require("./router/otp-auth2"))



app.listen(PORT, () => {
    console.log(`Server Started on Port ${PORT}`)
})