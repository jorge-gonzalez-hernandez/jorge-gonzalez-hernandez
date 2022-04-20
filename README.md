# portfolio-website
A personal website that showcases my projects, as well, as some information about me and how to contact me.

Student: Jorge Gonzalez #101142937

IMPORTANT NOTE: add restaurant does not support adding a restaurant with the same name as
			an existing restaurant.

STEPS TO RUN:
	- *in folder where server.js exists*
	- npm init
	- npm install express
	- npm install pug
	- node server.js

- The html is from three pug templates: addrestaurant.pug, singleRestaurant.pug, restaurants.pug

Additions:
    - The server creates a JSON file when adding a restaurant
	thus, reads from "./restaurants/" directory for a list of restaurants
--------------------------------------------------------------------------------
README 2:
STEPS TO RUN:
	- *in folder where server.js exists*
	- npm init
	- npm install express
	- npm install pug
	- npm install express-session
	- npm install mongodb
	- npm install connect-mongodb-session
	- *run mongo daemon* -> C:\Program Files\MongoDB\Server\5.0\bin>mongod.exe
		- Search through database -> C:\Program Files\MongoDB\Server\5.0\bin>mongo.exe
		- database initializer -> node database-initializer.js
	- node server.js

Additions:
	The server ends up adding a session colletion and an order collection in the a4 database

© 2022 GitHub, Inc.
Terms
Privacy
Security
Status
Docs
Contact G
