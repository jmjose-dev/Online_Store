//Define requirements
var ex = require("express");
var ej = require("ejs");
var mongoose = require("mongoose");
var app = ex();
var bP = require("body-parser"); 
var methodOverride = require("method-override");
var sanitizer = require("express-sanitizer");
var port = process.env.PORT || 3000;
var isLoggedIn = 0;
var firstTime = 1;
var acc_type ="", acct_status ="";
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
  fulln: String,
  account: String
});
//define schema of LoginLogs Collection
var loginlogsSchema = new mongoose.Schema({
  LogFullN: String,
  LogDate: String,
  LogTime: String,
  LogCount: String
});
//define schema of LoginLevel Collection
var loginlevelsSchema = new mongoose.Schema({
  level: String,
  status: String
});
//define schema for clitems Collection
var itemsSchema = new mongoose.Schema({
  id: String,
  iname: String,
  ibrand: String,
  icolor: String,
  iprice: String,
  iqty: String
});
//define schema for clbrands collection
var brandsSchema = new mongoose.Schema({
  ibrand: String,
  ishortcode: String
});
//connect Login schema to loginProcess object
var loginProcess = mongoose.model("logins",loginSchema);
//Connect Loginlogs Schema to loginlogs object
var loginLogs = mongoose.model("loginlogs",loginlogsSchema);
//Connect loginlevels schema to loginlevels object
var loginLevels = mongoose.model("loginlevels",loginlevelsSchema);
//Connect clitems schema to cl_items object
var cl_items = mongoose.model("clitems",itemsSchema);
//connect brands Schema to cl_brands object
var cl_brands = mongoose.model("clbrands",brandsSchema);
app.use(bP.urlencoded({extended: true}));
app.use(ex.static("public"));
app.use(methodOverride("_method"));
app.use(sanitizer());
//root. Will redirect to /login if not yet logged in, otherwise will go to index.ejs
app.get("/", function (req, res) {
  if (isLoggedIn==0)
    {
      res.redirect("/login");
    }
  else
    {
      res.render("index.ejs",{fullname:fn,dl:datelog,tl:timelog,acc_type:acct_status});
    }
});

//login page
app.get("/login", function(req,res){
  res.render("login.ejs",{isLogged:isLoggedIn,ft:firstTime});
});
//login processing
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
    //Login Success Flag
    isLoggedIn = 1;
    //store Full name found in DB to fn
    fn = data[0].fulln;
    //store account type # (0,1,2) to acc_type
    acc_type = data[0].account;
    //START OF WIP use acc_type to find account status (Administrator, Super Administrator, User) and store to acct_status
    //loginLevels.find({level:acc_type}), function(err, data){
    //     acct_status = data[0].status;
    //};
    //END OF WIP
    //Temp Code
    acct_status = acc_type;
    //determine number of logins of this account
    numlog = loginLogs.countDocuments({LogFullN:fn});
    numlog++;
    //save date and time of login
    datelog = d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear();
    timelog = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    //add to login log with acquired date, time and total number of logins+1
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

//view items
app.get("/items", function(req,res){
  cl_items.find({}, function(err, ditems){
    if(err){
      console.log(err);
    }
    else
    {
      res.render("items.ejs", {ditems:ditems});
    }
  });
});
//add new item
app.get("/items/additem", function(req, res){
  cl_brands.find({}, function(err, dbrands){
    if(err){
      console.log(err);
    }
    else
    {
      res.render("additem.ejs", {dbrands:dbrands});
    }

  });
});
//process the added item
app.post("/items", function(req,res){
  cl_items.create(req.body.ditems, function(err, newItem){
      req.body.ditems = sanitizer(req.body.ditems);
      if(err)
      {
        res.render("additem.ejs");
      }
      else
      {
        res.redirect("/items");
      }
  });
});
//Edit Item
app.get("/items/:id/edit", function(req, res){
  cl_items.findById(req.params.id, function(err, foundI){
    if(err){
        res.redirect("/items");
    }
    else
    {
      res.render("edititem.ejs", {eitem:foundI});
    }
  });
});
//UPDATE route
app.put("/items/:id", function(req, res){
  req.body.ditems = sanitizer(req.body.upItem);
  cl_items.findByIdAndUpdate(req.params.id,req.body.upItem,function(err, updateItem)
  {

    if(err)
    {
      res.redirect("/items");
    }
    else
    {
      res.redirect("/items");
    }
  });

});
app.get("/items/:id/destroy", function(req, res){
  cl_items.findByIdAndDelete(req.params.id,function (err, deletedItem){
    if(err)
    {
      res.redirect("/items");
    }
    else
    {
      res.redirect("/items");
    }
  });





});
app.listen(port, function () {
  console.log("Server is running");
});
