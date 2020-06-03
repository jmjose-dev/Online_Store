//Define requirements
var ex = require("express");
var ej = require("ejs");
var mongoose = require("mongoose");
var app = ex();
var bP = require("body-parser"); 
var port = process.env.PORT || 3000;
var isLoggedIn = false;
const request = require('request');
//define database location
const url = 'mongodb://127.0.0.1:27017/logincreds';
//connect defined db to mongoose
mongoose.set('useUnifiedTopology', true);
mongoose.connect(url, {useNewUrlParser: true});
//define schema of Login Collection
var loginSchema = new mongoose.Schema({
	uname: String,
	pword: String
});
//connect Login schema to loginProcess object
var loginProcess = mongoose.model("logins",loginSchema);
app.use(bP.urlencoded({extended: true}));
app.use(ex.static("public"));

app.get("/", function (req, res) {
  if (!isLoggedIn)
    {
      res.redirect("/login");
    }
  else
    {
      res.render("index.ejs");
    }
});
app.get("/login", function(req,res){
  res.render("login.ejs");
});
app.post("/loginprocess", function(req,res){
  var un,pw;
  un=req.body.txt_uname;
  pw=req.body.txt_pword;
  loginProcess.find({uname:un, pword:pw}, function(err, data){
  if(err){
    console.log(err);
    return
  }
  if(data.length == 0) {
    console.log("No record found");
    isLoggedIn = false;
    res.redirect("/");
    return
  }
  else{
    isLoggedIn = true;
    res.redirect("/");
    }
 });
 
});
app.listen(port, function () {
  console.log("Server is running");
});
