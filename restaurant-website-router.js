const express = require('express');
const session = require('express-session');
const mc = require('mongodb').MongoClient;
const MongoDBStore = require('connect-mongodb-session')(session);
const fs = require("fs");

let router = express.Router();

//const app = express();
//const PORT = process.env.PORT || 3000;
const path = require('path');

//Variable to store reference to database
let db;

//store session
const mongoStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/a4',
    collection: 'sessions'
});
mongoStore.on('error', (error) => {console.log(error)});

//app.set("views","./public/views");
//app.set('view engine','pug');

//session
router.use(session({ 
    secret:"some secret key here",
    store: mongoStore,
    resave: true,
    saveUninitialized: true
}));

//app.use = for ANY request
//ROUTERS
//let loginRouter = require("./login-router");
//app.use("/login", loginRouter);
//let addRestRouter = require("./add-restaurant-router");
//app.use("/addrestaurant", addRestRouter);

router.use(express.urlencoded({extended: true}));
//Serve static resources from public, if they exist
router.use(express.static("public"));
//If the resource wasn't in public, serve from other
router.use(express.static("other"));
//If the resource wasn't in other, continue the chain

//app.get('/', function (req, res, next) {res.render('pages/home', {loggedin: req}); });

router.get('/', auth, function (req, res, next) {
    res.render('pages/home', {loggedin: req.session.loggedin}); 
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
router.post('/logout', express.json(), logout);

function logout(req,res,next){
	let obj = req.body;
    req.session.loggedin = obj.loggedin;
    req.session.user = null;
    res.render('pages/home', {loggedin: req.session.loggedin});
}

/*////////////////////////////////////////////////
                LOGIN ROUTER
*/////////////////////////////////////////////////
router.get("/login", loadLoginPage);
router.get("/login/:username",checkLogin, loadLoginPage);
router.post("/login", express.json(), submitLogIn);

//renders add page
function loadLoginPage(req,res,next){
    res.format({
		"text/html": () => {res.render("pages/login", {loggedin: req.session.loggedin}); },
		"application/json": () => {res.status(200).json({valid: req.validLogIn})}
	});
	next();
}

let currUser;

function checkLogin(req, res, next){
    let name = req.params.username;

    db.collection("users").find({username: name}).toArray(function(err,result){
		if(err) throw err;
		if(Object.keys(result).length === 0){ //no existing user with that username
            req.validLogIn = false;
        }
        else{
            req.validLogIn = true;
            req.session.user = req.params.username;
            //req.session.user = result[0].name;
        }
        next();
	});
}

function submitLogIn(req, res, next){
    let r = req.body;
    req.session.loggedin = true;
    next();
}
/*////////////////////////////////////////////////
                USERS ROUTER
*/////////////////////////////////////////////////

router.get("/users", auth, findUsers, renderUsersPage);
router.get("/users/:userId", authUser, findSingleUser, loadUserOrders, renderUser);

router.post("/users/:userId/changeprivacy", express.json(), changePrivacy);

function renderUsersPage(req,res,next){
    res.format({
		"text/html": () => {res.render("pages/users", {users: req.users, loggedin: req.session.loggedin}); },
		"application/json": () => {res.status(200).json();}
	});
	next();
}

function authUser(req,res,next){
    let userId = req.params.userId;
    if(req.session.loggedin == true){ //a user is logged in 
        if(userId == req.session.user){//trying to view current user -> allow access
            req.own = true;
            req.auth = true;
			next();
        }
        else{//trying to view another user -> allow if other user is public
            req.own = false; 
			db.collection("users").find({username : userId}).toArray(function(err,result){
				if(err) throw err;
				if(result[0].privacy == false){ //user is public -> allow access
					req.auth = true;
				}
				else{ //user is private -> don't allow access
					req.auth = false;
				}
				next();
			});
        }
    }
    else{ // no current logged in user
        req.own = false;
		db.collection("users").find({username : userId}).toArray(function(err,result){
			if(err) throw err;
			if(result[0].privacy == false){ //user is public -> allow access
				req.auth = true;
			}
			else{ //user is private -> don't allow access
				req.auth = false;
			}
			next();
		});
    }
    
}

//helper function
function checkPrivacy(userId){
    db.collection("users").find({username : userId}).toArray(function(err,result){
        if(err) throw err;
        if(result[0].privacy == false){ //user is public -> allow access
			return true;
        }
        else{ //user is private -> don't allow access
            return false;
        }
    });
}

function findSingleUser(req,res,next){
    if(!req.auth){
        res.status(404).send("CANNOT VIEW PROFILE");
        return;
    }

    let userId = req.params.userId;

    db.collection("users").find({username : userId}).toArray(function(err,result){
		if(err) throw err;
		req.user = result[0];
        next();
	});

}

function loadUserOrders(req,res,next){
	let userId = req.params.userId;
	db.collection("orders").find({user : userId}).toArray(function(err,result){
		if(err) throw err;
		req.orders = result;
        next();
	});
}

function renderUser(req,res,next){
    res.format({
		"text/html": () => {res.render("pages/singleUser", {user: req.user, loggedin: req.session.loggedin, owner: req.own, orders: req.orders}); },
		"application/json": () => {res.status(200).json();}
	});
	next();
}

function findUsers(req,res,next){
	if(Object.keys(req.query).length === 0){
		db.collection("users").find({privacy : false}).toArray(function(err,result){
			if(err) throw err;
			req.users = result;
			next();
		});
	}else{
		let queryName = req.query.name;
		console.log(queryName);
		db.collection("users").find({username: {$regex:queryName, $options:"i"},privacy : false}).toArray(function(err,result){
			if(err) throw err;
			console.log(result);
			req.users = result;
			next();
		});
	}
    
}

function changePrivacy(req,res,next){
    let privacyObj = req.body;

    db.collection("users").updateOne({username: req.params.userId}, {$set: {privacy: privacyObj.private}}, function(err,result){
		if(err) throw err;
	});
}

/*////////////////////////////////////////////////
               REGISTER ROUTER
*/////////////////////////////////////////////////

router.get("/registration", auth, loadRegisterPage);

router.get("/registration/:username",checkRegister,loadRegisterPage);

router.post("/registration", express.json(), submitRegister);

let validReg; //holds if registration is valid

//renders add page
function loadRegisterPage(req,res,next){
    res.format({
		"text/html": () => {res.render("pages/register", {loggedin: req.session.loggedin}); },
		"application/json": () => {res.status(200).json({valid: req.validReg});}
	});
	next();
}

function checkRegister(req,res,next){
    let name = req.params.username;

    db.collection("users").find({username: name}).toArray(function(err,result){
		if(err) throw err;
		if(Object.keys(result).length === 0){
            req.validReg = true;
        }
        else{
            req.validReg = false;
        }
        next();
	});
    
}

function submitRegister(req, res, next){
    let r = req.body;

    db.collection("users").insertOne({username: r.username, password: r.password, privacy: false}, function(err,result){
		if(err) throw err;
		
	});
    req.session.loggedin = true;
	req.session.user = r.username;
    next();
}
/*////////////////////////////////////////////////
            ORDER FORM ROUTER
*/////////////////////////////////////////////////
router.get("/orders", /*auth,*/ loadOrderForm);
router.get("/restaurants", loadRestaurants, respondRestaurants);
router.post("/orders", express.json(),submitOrder);
router.get("/orders/:orderId", findOrder, authOrder, renderOrder);

function loadOrderForm(req,res,next){
    res.sendFile(path.join(__dirname, '/order.html'));
}

function loadRestaurants(req,res,next){
    let restaurantsOBJ = {};
    for(const rest in restaurants){
        restaurantsOBJ[restaurants[rest].name] = restaurants[rest];
    }
    req.restaurants = restaurantsOBJ;
    next();
}

function respondRestaurants(req,res,next){
    res.setHeader("Content-Type","application/JSON");
    res.status(200);
    res.write(JSON.stringify(req.restaurants));
    res.end();
}

function submitOrder(req,res,next){
    let r = req.body;
    let currUser = req.session.user;
    db.collection("orders").insertOne({user: currUser, order: req.body}, function(err,result){
		if(err) throw err;
	});
}

function findOrder(req,res,next){
	let orderId = req.params.orderId;
	let ObjectId = require('mongodb').ObjectId;
	let oId = new ObjectId(orderId);


	db.collection("orders").find({_id: oId}).toArray(function(err,result){
		if(err) throw err;
		req.order = result[0].order;
		req.user = result[0].user;
		next();
	});
}

function authOrder(req,res,next){
	let orderId = req.params.orderId;
	let userId = req.user;
    if(req.session.loggedin == true){ //a user is logged in 
        if(userId == req.session.user){//trying to view current user order -> allow access
            req.own = true;
            req.auth = true;
			next();
        }
        else{//trying to view another user order -> allow if other user is public
            req.own = false; 
            //req.auth = checkPrivacy(userId);
			db.collection("users").find({username : userId}).toArray(function(err,result){
				if(err) throw err;
				if(result[0].privacy == false){ //user is public -> allow access
					req.auth = true;
				}
				else{ //user is private -> don't allow access
					req.auth = false;
				}
				next();
			});
        }
    }
    else{ // no current logged in user
        req.own = false;
        //req.auth = checkPrivacy(userId);
		db.collection("users").find({username : userId}).toArray(function(err,result){
			if(err) throw err;
			if(result[0].privacy == false){ //user is public -> allow access
				req.auth = true;
			}
			else{ //user is private -> don't allow access
				req.auth = false;
			}
			next();
		});
    }
}

function renderOrder(req,res,next){
	if(!req.auth){
        res.status(404).send("CANNOT VIEW ORDER");
        return;
    }
	res.format({
		"text/html": () => {res.render("pages/singleOrder", {order: req.order, user: req.user, loggedin: req.session.loggedin}); },
		"application/json": () => {}
	});
	next();
}
/*////////////////////////////////////////////////
            	PROFILE ROUTER
*/////////////////////////////////////////////////
router.get("/profile", findProfile, loadProfileOrders, renderProfile);

function findProfile(req,res,next){
    let userId = req.session.user;
	if(userId == null){
		res.status(404).send("CANNOT VIEW PROFILE");
	}
    db.collection("users").find({username : userId}).toArray(function(err,result){
		if(err) throw err;
		req.user = result[0];
		req.own = true;
        next();
	});

}

function loadProfileOrders(req,res,next){
	let userId = req.user.username;
	db.collection("orders").find({user : userId}).toArray(function(err,result){
		if(err) throw err;
		req.orders = result;
        next();
	});
}

function renderProfile(req,res,next){
    res.format({
		"text/html": () => {res.render("pages/singleUser", {user: req.user, loggedin: req.session.loggedin, owner: req.own, orders: req.orders}); },
		"application/json": () => {res.status(200).json();}
	});
	next();
}

/*////////////////////////////////////////////////
            CONNECTING TO DATABASE
*/////////////////////////////////////////////////
mc.connect("mongodb://localhost:27017", function(err, client) {
	if (err) {
		console.log("Error in connecting to database");
		console.log(err);
		return;
	}
	
	//Get the database and save it to a variable
	db = client.db("a4");

	//Only start listening now, when we know the database is available
	//router.listen(3000);
	console.log("in mc.connect");
});

/*////////////////////////////////////////////////
            RESTAURANT INFORMATION
*/////////////////////////////////////////////////

let aragorn = {
	id: 0,
	name: "Aragorn's Orc BBQ",
	min_order: 20,
	delivery_fee: 5,
	menu: {
		"Appetizers": {
			0: {
				name: "Orc feet",
				description: "Seasoned and grilled over an open flame.",
				price: 5.50
			},
			1: {
				name: "Pickled Orc fingers",
				description: "Served with warm bread, 5 per order.",
				price: 4.00
			},
			2: { //Thank you Kiratchii
				name: "Sauron's Lava Soup",
				description: "It's just really spicy water.",
				price: 7.50
			},
			3: {
				name: "Eowyn's (In)Famous Stew",
				description: "Bet you can't eat it all.",
				price: 0.50
			},
			4: {
				name: "The 9 rings of men.",
				description: "The finest of onion rings served with 9 different dipping sauces.",
				price: 14.50
			}
		},
		"Combos": {
			5: {
				name: "Buying the Farm",
				description: "An arm and a leg, a side of cheek meat, and a buttered biscuit.",
				price: 15.99
			},
			6: {
				name: "The Black Gate Box",
				description: "Lots of unidentified pieces. Serves 50.",
				price: 65.00
			},
			7: {//Thanks to M_Sabeyon
				name: "Mount Doom Roast Special with Side of Precious Onion Rings.",
				description: "Smeagol's favorite.",
				price: 15.75
			},
			8: { //Thanks Shar[TA]
				name: "Morgoth's Scorched Burgers with Chips",
				description: "Blackened beyond recognition.",
				price: 13.33
				
			},
			10: {
				name: "Slab of Lurtz Meat with Greens.",
				description: "Get it while supplies last.",
				price: 17.50
			},
			11: {
				name: "Rangers Field Feast.",
				description: "Is it chicken? Is it rabbit? Or...",
				price: 5.99
			}
		},
		"Drinks": {
			12: {
				name: "Orc's Blood Mead",
				description: "It's actually raspberries - Orc's blood would be gross.",
				price: 5.99
			},
			13: {
				name: "Gondorian Grenache",
				description: "A fine rose wine.",
				price: 7.99
			},
			14: {
				name: "Mordor Mourvedre",
				description: "A less-fine rose wine.",
				price: 5.99
			}
		}	
	}
}

let legolas = {
	id: 1,
	name: "Lembas by Legolas",
	min_order: 15,
	delivery_fee: 3.99,
	menu: {
		"Lembas": {
			0: {
				name: "Single",
				description: "One piece of lembas.",
				price: 3
			},
			1: {
				name: "Double",
				description: "Two pieces of lembas.",
				price: 5.50
			},
			2: { 
				name: "Triple",
				description: "Three pieces, which should be more than enough.",
				price: 8.00
			}
		},
		"Combos": {
			3: {
				name: "Second Breakfast",
				description: "Two pieces of lembas with honey.",
				price: 7.50
			},
			4: {
				name: "There and Back Again",
				description: "All you need for a long journey - 6 pieces of lembas, salted pork, and a flagon of wine.",
				price: 25.99
			},
			5: {
				name: "Best Friends Forever",
				description: "Lembas and a heavy stout.",
				price: 6.60
			}
		}
	}
}

let frodo = {
	id: 2,
	name: "Frodo's Flapjacks",
	min_order: 35,
	delivery_fee: 6,
	menu: {
		"Breakfast": {
			0: {
				name: "Hobbit Hash",
				description: "Five flapjacks, potatoes, leeks, garlic, cheese.",
				price: 9.00
			},
			1: {
				name: "The Full Flapjack Breakfast",
				description: "Eight flapjacks, two sausages, 3 eggs, 4 slices of bacon, beans, and a coffee.",
				price: 14.00
			},
			2: { 
				name: "Southfarthing Slammer",
				description: "15 flapjacks and 2 pints of syrup.",
				price: 12.00
			}
			
		},
		"Second Breakfast": {
			3: {
				name: "Beorning Breakfast",
				description: "6 flapjacks smothers in honey.",
				price: 7.50
			},
			4: {
				name: "Shire Strawberry Special",
				description: "6 flapjacks and a hearty serving of strawberry jam.",
				price: 8
			},
			5: {
				name: "Buckland Blackberry Breakfast",
				description: "6 flapjacks covered in fresh blackberries. Served with a large side of sausage.",
				price: 14.99
			}
		},
		"Elevenses": {
			6: {
				name: "Lembas",
				description: "Three pieces of traditional Elvish Waybread",
				price: 7.70
			},
			7: {
				name: "Muffins of the Marish",
				description: "A variety of 8 different types of muffins, served with tea.",
				price: 9.00
			},
			8: {
				name: "Hasty Hobbit Hash",
				description: "Potatoes with onions and cheese. Served with coffee.",
				price: 5.00
			}
		},
		"Luncheon": {
			9: {
				name: "Shepherd's Pie",
				description: "A classic. Includes 3 pies.",
				price: 15.99
			},
			10: {
				name: "Roast Pork",
				description: "An entire pig slow-roasted over a fire.",
				price: 27.99
			},
			11: {
				name: "Fish and Chips",
				description: "Fish - fried. Chips - nice and crispy.",
				price: 5.99
			}
		},
		"Afternoon Tea": {
			12: {
				name: "Tea",
				description: "Served with sugar and cream.",
				price: 3
			},
			13: {
				name: "Coffee",
				description: "Served with sugar and cream.",
				price: 3.50
			},
			14: {
				name: "Cookies and Cream",
				description: "A dozen cookies served with a vat of cream.",
				price: 15.99
			},
			15: {
				name: "Mixed Berry Pie",
				description: "Fresh baked daily.",
				price: 7.00
			}
		},
		"Dinner": {
			16: {
				name: "Po-ta-to Platter",
				description: "Boiled. Mashed. Stuck in a stew.",
				price: 6
			},
			17: {
				name: "Bree and Apple",
				description: "One wheel of brie with slices of apple.",
				price: 7.99
			},
			18: {
				name: "Maggot's Mushroom Mashup",
				description: "It sounds disgusting, but its pretty good",
				price: 6.50
			},
			19: {
				name: "Fresh Baked Bread",
				description: "A whole loaf of the finest bread the Shire has to offer.",
				price: 6
			},
			20: {
				name: "Pint of Ale",
				description: "Yes, it comes in pints.",
				price: 5
			}
		},
		"Supper": {
			21: {
				name: "Sausage Sandwich",
				description: "Six whole sausages served on a loaf of bread. Covered in onions, mushrooms and gravy.",
				price: 15.99
			},
			22: {
				name: "Shire Supper",
				description: "End the day as you started it, with a dozen flapjacks, 5 eggs, 3 sausages, 7 pieces of bacon, and a pint of ale.",
				price: 37.99
			}
		}
	}
}

//This should also be removed. The restaurant names should also come from the server.
let restaurants = {"Aragorn's Orc BBQ": aragorn, "Lembas by Legolas": legolas, "Frodo's Flapjacks": frodo};
