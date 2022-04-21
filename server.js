const express = require('express');
const session = require('express-session');
const mc = require('mongodb').MongoClient;
const MongoDBStore = require('connect-mongodb-session')(session);
let app = express();
const path = require('path');
const host = '0.0.0.0';
const port = process.env.PORT || 3000;

//variable to store reference to database
let db;

//store session data in mongo
const mongoStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/a4',
    collection: 'sessions'
});
mongoStore.on('error', (error) => {console.log(error)});

app.set("views","./public/views");
app.set('view engine','pug');

//session
app.use(session({ 
    secret:"some secret key here",
    store: mongoStore,
    resave: true,
    saveUninitialized: true
}));

//app.use = for ANY request
//ROUTERS
let restWebsiteRouter = require("./restaurant-website-router");
app.use("/restaurant-order", restWebsiteRouter);
// let addRestRouter = require("./add-restaurant-router");
// app.use("/addrestaurant", addRestRouter);

app.use(express.urlencoded({extended: true}));
//Serve static resources from public, if they exist
app.use(express.static("public"));
//If the resource wasn't in public, serve from other
app.use(express.static("other"));
//If the resource wasn't in other, continue the chain

//THE WHOLE PORTOFOLIO WEBSITE
app.get('/', function (req, res, next) {res.render('pages/home'); });
app.get('/about-me', function (req, res, next) {res.render('pages/about'); });
app.get('/contact-me', function (req, res, next) {res.render('pages/contact'); });
app.get('/projects', function (req, res, next) {res.render('pages/projects'); });
app.get('/projects/algorithm-visualization', function (req, res, next) {res.render('pages/algorithm-visualization'); });
app.get('/projects/algorithm-visualization/dijkstra-algorithm', function (req, res, next) {res.render('pages/dijkstra-algorithm'); });


//THE RESTAURANT ORDER WEBSITE
app.get('/restaurant-order', auth, function (req, res, next) {
    res.render('pages/resHome', {loggedin: req.session.loggedin}); 
});

function auth(req,res,next){
    
    if(req.session.loggedin == null){
        req.session.loggedin = false;
    }
    next();
}

/*////////////////////////////////////////////////
                LOGOUT ROUTER
*/////////////////////////////////////////////////
app.post('/logout', express.json(), logout);

function logout(req,res,next){
	let obj = req.body;
    req.session.loggedin = obj.loggedin;
    req.session.user = null;
    res.render('pages/home', {loggedin: req.session.loggedin});
}



//This is a shorthand way of creating/initializing the HTTP server

app.listen(port,host,function(){
    console.log("Server Has Started.......");
});

//console.sdfg