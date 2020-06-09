//Define requirements
var ex = require("express");
var ej = require("ejs");
var mongoose = require("mongoose");
var app = ex();
var bP = require("body-parser"); 
var port = process.env.PORT || 3000;
var isLoggedIn = 0;
var firstTime = 1;
var fn, fullname,datelog,timelog;
var d = new Date();
const request = require('request');
//define database location
const url = 'mongodb://127.0.0.1:27017/logincreds';
//connect defined db to mongoose
mongoose.set('useUnifiedTopology', true);
mongoose.connect(url, {useNewUrlParser: true});
//define schema of Login Collection
var loginSchema = new mongoose.Schema({
	uname: String,
  pword: String,
  fulln: String
});
var loginlogsSchema = new mongoose.Schema({
  LogFullN: String,
  LogDate: String,
  LogTime: String,
  LogCount: String
});
//connect Login schema to loginProcess object
var loginProcess = mongoose.model("logins",loginSchema);
//Connect Loginlogs Schema to loginlogs object
var loginLogs = mongoose.model("loginlogs",loginlogsSchema);

app.use(bP.urlencoded({extended: true}));
app.use(ex.static("public"));

app.get("/", function (req, res) {
  if (isLoggedIn==0)
    {
      res.redirect("/login");
    }
  else
    {
      res.render("index.ejs",{fullname:fn,dl:datelog,tl:timelog});
    }
});
app.get("/login", function(req,res){
  res.render("login.ejs",{isLogged:isLoggedIn,ft:firstTime});
});
app.post("/loginprocess", function(req,res){
  var un,pw,numlog=0;
  var newLog;
  un=req.body.txt_uname;
  pw=req.body.txt_pword;
  loginProcess.find({uname:un, pword:pw}, function(err, data){
  if(err){
    console.log(err);
    return
  }
  if(data.length == 0) {
    console.log("No record found");
    isLoggedIn = 0;
    firstTime = 0;
    res.redirect("/");
    return
  }
  else{
    isLoggedIn = 1;
    fn = data[0].fulln;
    numlog = loginLogs.countDocuments({LogFullN:fn});
    numlog++;
    datelog = d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear();
    timelog = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    newlog = new loginLogs({LogFullN:fn,LogDate:datelog,LogTime:timelog,LogCount:numlog});
    newlog.save(function (err,book) {
      
        if (err)
          {
            return console.error(err);
          }
        else
          {
            console.log("Login logged!");
          }
      });
    res.redirect("/");
    }
 });
 
});
app.listen(port, function () {
  console.log("Server is running");
});
