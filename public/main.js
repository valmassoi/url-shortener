//TODO BABEL

var path = require('path')
var express = require('express')
var http = require('http')
var shortid = require('shortid')
var mongo = require('mongodb').MongoClient

var app = express()

const dbUrl = 'mongodb://localhost:27017/data' //change PORT


function checkUrl(){

}

function shorten(input){

  checkUrl(input) //TODO if input is good

  //create id
  var id = shortid.generate()//TODO  //testing with xxx
  console.log(id)


  var item = {
    "original_url": input,
    "id": id
  } //Make sure you use JSON.stringify convert it to JSON.

  mongo.connect(dbUrl, function(err, db) { //mongo db input and id   CHECK IF USED
    if (err) throw err
    var urls = db.collection('urls')
    urls.find({ //TODO CHECK BOTH ID AND url
      "original_url": {
        $eq: input
      }
    }).toArray(function(err, exists) {
      if (err) throw err
      if (exists.length != 0){
        console.log("tryagain")
        console.log(exists)
      }
      else{
        urls.insert(item, function(err, data) {// if not in docs
          if (err) throw err
          console.log(JSON.stringify(item))
          db.close()
        })
      }
    })
  })

  return id

}

function checkDb(shorturl){
  console.log(shorturl);
  mongo.connect(dbUrl, function(err, db) {
    if (err) throw err
    var urls = db.collection('urls')
    urls.find({ //CHECK
      "id": {
        $eq: shorturl
      }
    }).toArray(function(err, exists) {
      if (err) throw err
      if (exists.length != 0){
        console.log("return true");
        return true;
      }
      if (exists.length == 0){
        console.log("dont exist fam");
        return false;
      }
    })
  })
}

app.all("*", function(req, res, next) {
  next()
});
app.get("/:shorturl", function(req, res) {
  var shorturl = req.params.shorturl
  //if in db redirect
  if (checkDb(shorturl)){
    console.log("redirect");
    res.redirect("http://www.apple.com")//TODO Change to longurl from db
  }
  else{
    console.log("no redirect");
    res.end()
  }
});

app.get("/new/:origUrl", function(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  var origUrl = req.params.origUrl
  var shortUrl = "minime.herokuapp.com/" + shorten(origUrl)//TODO make url dynamic
  var json = JSON.stringify({"original_url": origUrl, "short_url": shortUrl})
  res.end(json)
});

app.get("*", function(req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("404!")
});
var port = process.env.PORT || 8080;
http.createServer(app).listen(port)
console.log("Server Running on port:" + port)
