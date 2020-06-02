var ex = require("express");
var ej = require("ejs");
var app = ex();
var port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'
const dbName = 'logincreds'
let db
MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference to the database so you can use it later
  db = client.db(dbName)
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)
})
app.use(ex.static("public"));
app.get("/", function (req, res) {
  res.render("index.ejs");
});
app.listen(port, function () {
  console.log("Server is running");
});
