const express = require('express');
let app = express();

app.set("views","./public/views");
app.set('view engine','pug');



//app.use = for ANY request
//ROUTERS
// let restRouter = require("./restaurant-router");
// app.use("/restaurants", restRouter);
// let addRestRouter = require("./add-restaurant-router");
// app.use("/addrestaurant", addRestRouter);


//Serve static resources from public, if they exist
app.use(express.static("public"));
//If the resource wasn't in public, serve from other
app.use(express.static("other"));
//If the resource wasn't in other, continue the chain

app.get('/', function (req, res, next) {res.render('pages/home'); });
app.get('/about-me', function (req, res, next) {res.render('pages/about'); });
app.get('/contact-me', function (req, res, next) {res.render('pages/contact'); });
app.get('/projects', function (req, res, next) {res.render('pages/projects'); });
app.get('/projects/algorithm-visualization', function (req, res, next) {res.render('pages/algorithm-visualization'); });
app.get('/projects/algorithm-visualization/dijkstra-algorithm', function (req, res, next) {res.render('pages/dijkstra-algorithm'); });

//This is a shorthand way of creating/initializing the HTTP server
app.listen(process.env.PORT || 3000);
console.log("Server listening at http://localhost:3000");