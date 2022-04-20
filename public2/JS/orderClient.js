//holds singular restaurant information
let restaurant = {};

//holds all restaurant names
let restaurantNames = [];

//holds all restaurants
let restaurants = {};

//stores an array of order objects
let orderArr = [];
let orderArrInfo = {};
//stores integer value of which restaurant is currently selected
let restaurantSelected;

function init(){
    getDropDownInfo();
}

//sends get request to server for information to fill drop down
function getDropDownInfo(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			restaurants = JSON.parse(req.responseText);
			populateRestNameArr();
			populateDropDown(); //call function to fill in the list div
		}
	}

	req.open("GET","http://localhost:3000/restaurants");
	req.send();
}


//helper function to drop down population
function populateRestNameArr(){
	for(const rest in restaurants){
		restaurantNames.push(restaurants[rest].name);
	}
}


//dynamically populates the restaurant dropdown
function populateDropDown(){
    let option = document.createElement('option');
    option.textContent = "Select a restaurant...";
    option.value = -1;
    document.getElementById("restSelect").appendChild(option);
    for(let i = 0; i < restaurantNames.length; i++){
        let option = document.createElement('option');
        option.textContent = restaurantNames[i];
        option.value = i;
        document.getElementById("restSelect").appendChild(option);
    }
}

//sends get request to server for a specific restaurant
function getRestaurantInfo(){
	//read selected item in dropdown
	let select = document.getElementById('restSelect');
	restaurantSelected = select.options[select.selectedIndex].value;
	for(const rest in restaurants){
		if(restaurantNames[restaurantSelected] == restaurants[rest].name){
			restaurant = restaurants[rest];
			break;
		}
	}
	loadRestaurant();
}

//loads the category and menu column of the currently selected restaurant information
function loadRestaurant(){
	let prevRestaurant = -1;


	if(prevRestaurant != restaurantSelected && orderArr.length != 0){//there are items in the order & not same restaurant
		if(confirm("Do you want to clear the order? Press OK if YES")){ //YES CLEAR
			clearOrder();
			//document.getElementById("orderColumn").innerHTML = "";
			printOrderTitle();
		}
		else{
			restaurantSelected = prevRestaurant;
			updateOrder();
			return;
		}
	}
	else if(prevRestaurant == restaurantSelected){ //same restaurant
		console.log(prevRestaurant);
		updateOrder();
		return;
	}
	else if(prevRestaurant != restaurantSelected){ //changed restaurant without orders
		//document.getElementById("orderColumn").innerHTML = "";
		printOrderTitle();
	}
	

	//if no restaurant is selected
    if(restaurantSelected < 0){
        alert("Please select a restaurant");
        return;
    }

	printMenuTitle();
	printCategoryTitle();

	//remove previous restaurant details
	var content = document.getElementById("content");
	
	if(content.lastElementChild.id !== "searchBtn"){
		content.removeChild(content.lastElementChild);
	}
	

	//show restaurant name
	document.getElementById('header1').innerHTML = restaurant.name;
	
	//details of the restaurant
	let restDetails = document.createElement('p');
	restDetails.textContent = "Minimum Order: $" + restaurant.min_order + ", Delivery Fee: $" + restaurant.delivery_fee; 
	restDetails.style.color = "white";
	content.appendChild(restDetails);
	content.style.padding = "0 0 2em 0";

	loadCategories();
	loadMenu();

}

//add menu categories in categoriesColumn(left column)
function loadCategories(){
	var container = document.getElementById("categoriesColumn");
	let br = document.createElement("br");

	let temp = restaurant.menu;

	
	//create menu link to display full menu
	var menu = document.createElement('a');
	var menuLink = document.createTextNode("Full Menu");
	menu.appendChild(menuLink);
	menu.title = "Full Menu";
	menu.href = "javascript:void(0);"; 
	menu.style.fontSize = "20px";
	menu.style.color = "black";
	
	menu.setAttribute('onclick','loadMenu();');
	container.appendChild(menu);
	container.appendChild(br);

	//create category links to display individual categories
	for (const category in temp){
		let br = document.createElement("br");

		var a = document.createElement('a');
		var link = document.createTextNode(category);
		a.appendChild(link);
		a.title = category;
		a.href = "javascript:void(0);"; 
		a.value = category;
		a.style.fontSize = "20px";
		a.style.color = "green";
		a.setAttribute('onclick','loadSpecificMenu(this.value);');

		container.appendChild(a);
		container.appendChild(br);
	}
}

//loads a specificly chosen category from the category links in the left column
function loadSpecificMenu(catName){
	var container = document.getElementById("menuColumn");
	printMenuTitle();
	
	let temp = restaurant.menu;

	//menu category
	let paragraph = document.createElement("p");
	paragraph.textContent = catName;
	paragraph.style.padding = "0 0 0 2em";
	paragraph.style.font = "bold 15px arial,serif";
	
	container.appendChild(paragraph);

	//category items
	for(const item in temp[catName]){ //iterate through items in categories

		var br = document.createElement("br");

		//insert add button
		let btn = document.createElement('button');
		btn.style.background = "blue";
		btn.style.color = "white";
		btn.style.textAlign = "center";
		btn.style.margin = "0 0 0 4em"; 
		btn.style.padding = "3px 3px 3px 3px";
		btn.style.height = "23px";
		btn.style.width = "17px";
		btn.style.borderRadius = "4px";
		btn.innerHTML = "+";
		btn.value = temp[catName][item].name;
		btn.setAttribute('onclick','addOrder(this.value);');
		container.appendChild(btn);

		//add item name
		let pName = document.createElement("p");
		pName.textContent = temp[catName][item].name;
		pName.style.padding = "0 0 0 4px";
		pName.style.margin = "0px 0 0 0";
		pName.style.display = "inline-block";
		container.appendChild(pName);

		
		
		container.appendChild(br); //breakline

		//add item description
		let pDesc = document.createElement("p");
		pDesc.textContent = temp[catName][item].description;
		pDesc.style.padding = "0 0 0 6em";
		pDesc.style.margin = "0px 0 0 0";
		container.appendChild(pDesc);

		container.appendChild(br); //breakline

		//add item price
		let pPrice = document.createElement("p");
		pPrice.textContent = "Price: $" + temp[catName][item].price.toFixed(2);
		pPrice.style.padding = "0 0 0 6em";
		pPrice.style.margin = "0px 0 0 0";
		container.appendChild(pPrice);

		container.appendChild(br); //breakline
	}
	
}

//deals with loading menu column (middle column)
function loadMenu(){
	var container = document.getElementById("menuColumn");
	printMenuTitle();

	let temp = restaurant.menu;

	//iterate through categories
	for (const category in temp){ 

		//menu category
		let paragraph = document.createElement("p");
        paragraph.textContent = category;
		paragraph.style.padding = "0 0 0 2em";
		paragraph.style.font = "bold 15px arial,serif";

		//declare container for menuColumn
		var container = document.getElementById("menuColumn");
        container.appendChild(paragraph);
		

		//iterate through items in categories
		for(const item in temp[category]){ 
			//insert add button
			let btn = document.createElement('button');
			btn.style.background = "blue";
			btn.style.color = "white";
			btn.style.textAlign = "center";
			btn.style.margin = "0 0 0 4em"; 
			btn.style.padding = "3px 3px 3px 3px";
			btn.style.height = "23px";
			btn.style.width = "17px";
			btn.style.borderRadius = "4px";
			btn.innerHTML = "+";
			btn.value = temp[category][item].name;
			btn.setAttribute('onclick','addOrder(this.value);');
			container.appendChild(btn);

			//add item name
			let pName = document.createElement("p");
            pName.textContent = temp[category][item].name;
			pName.style.padding = "0 0 0 4px";
			pName.style.margin = "0px 0 0 0";
			pName.style.display = "inline-block";
            container.appendChild(pName);

			//add item description
            let pDesc = document.createElement("p");
            pDesc.textContent = temp[category][item].description;
			pDesc.style.padding = "0 0 0 6em";
			pDesc.style.margin = "0px 0 0 0";
            container.appendChild(pDesc);

			//add item price
            let pPrice = document.createElement("p");
            pPrice.textContent = "Price: $" + temp[category][item].price.toFixed(2);
			pPrice.style.padding = "0 0 0 6em";
			pPrice.style.margin = "0px 0 0 0";
            container.appendChild(pPrice);
		}
	}
}

//adds orders into orderArr
function addOrder(itemName){
	let totPrice;
	let duplicate = false;
	let itemPrice = getPrice(itemName);

	//checks to be made before adding order to order array
	if(orderArr.length == 0){ //empty orderArr
		totPrice = totalPrice(1,itemName);
		orderArr.push({name: itemName, amount: 1, totalPrice: totPrice, price: itemPrice});
		item = 0;
		updateOrder();
	}
	else{//not empty orderArr
		for(let i = 0; i < orderArr.length; i++){
			orderArr[i].price;
			if(orderArr[i].name === itemName){ //not new item
				item = i;
				orderArr[i].amount++;
				totPrice = totalPrice(orderArr[i].amount, itemName);
				orderArr[i].totalPrice = totPrice;
				duplicate = true;
				updateOrder();
				break;
			}
		}
		if(duplicate == false){ //new item
			totPrice = totalPrice(1,itemName);
			orderArr.push({name: itemName, amount: 1, totalPrice: totPrice, price: itemPrice});
			item = orderArr.length - 1;
			updateOrder();
		}
	}
	
}

//removes order from orderArr
function removeOrder(itemName){
	for(let i = 0; i < orderArr.length; i++){
		if(orderArr[i].name == itemName){
			orderArr[i].amount--;
			orderArr[i].totalPrice -= orderArr[i].price;
			if(orderArr[i].amount == 0){
				orderArr.splice(i,1);
			}
			break;
		}
	}
	updateOrder();
}

//updates the order column(right) from the orderArr
function updateOrder(){
	let container = document.getElementById("orderColumn");
	printOrderTitle();

	if(orderArr.length == 0){
		return;
	}

	var br = document.createElement("br"); //breakline

	let sumOfPrices = 0; //sum of all prices

	//display all orders in order array
	for(let i = 0; i< orderArr.length; i++){
		
		//Display individual item order
		let paragraph = document.createElement("p");
    	paragraph.textContent = orderArr[i].name + ": " + orderArr[i].amount + " units, Total: $" + orderArr[i].totalPrice;
    	paragraph.style.fontSize = 18 + "px";
		paragraph.style.padding = "0 0 0 2em";
		paragraph.style.display = "inline-block";
    	container.appendChild(paragraph);

		//insert remove button
		let btn = document.createElement('button');
		btn.style.background = "red";
		btn.style.color = "white";
		btn.style.textAlign = "center";
		btn.style.margin = "0 0 0 1em"; 
		btn.style.padding = "3px 3px 3px 3px";
		btn.style.height = "23px";
		btn.style.width = "17px";
		btn.style.borderRadius = "4px";
		btn.innerHTML = "-";
		btn.value = orderArr[i].name;
		btn.setAttribute('onclick','removeOrder(this.value);');
		container.appendChild(btn);

		sumOfPrices += orderArr[i].totalPrice; 
	}

	container.appendChild(br);
	container.appendChild(br);

	//display minimum order requirement
	let orderReq = document.createElement("p");
	if(sumOfPrices >= restaurant.min_order){ //minimum order requirement is met
		//submit order button
		let btn = document.createElement('button');
		btn.style.background = "yellow";
		btn.style.color = "blue";
		btn.style.textAlign = "center";
		btn.style.margin = "0 0 0 2em"; 
		btn.style.padding = "4px 4px 4px 4px";
		btn.style.height = "auto";
		btn.style.width = "auto";
		btn.style.borderRadius = "4px";
		btn.style.fontSize = "15px";
		btn.innerHTML = "Submit Order";
		btn.setAttribute('onclick','submitOrder();');
		container.appendChild(btn);
	}
	else{ //minimum order requirement is NOT met
    	orderReq.textContent = "You must add $" + (restaurant.min_order - sumOfPrices).toFixed(2) + " more to your order";
    	orderReq.style.fontSize = 15 + "px";
		orderReq.style.padding = "0 0 0 2em";
		orderReq.style.color = "red";
	}
	container.appendChild(orderReq);

	//display subtotal
	let subtotal = document.createElement("p");
    subtotal.textContent = "Subtotal: $" + sumOfPrices.toFixed(2);
	orderArrInfo.subtotal = sumOfPrices.toFixed(2);
    subtotal.style.fontSize = 15 + "px";
	subtotal.style.padding = "0 0 0 2em";

	//display delivery fee
	let delivery = document.createElement("p");
    delivery.textContent = "Delivery Fee: $" + restaurant.delivery_fee.toFixed(2);
	orderArrInfo.delivery_fee = restaurant.delivery_fee.toFixed(2);
    delivery.style.fontSize = 15 + "px";
	delivery.style.padding = "0 0 0 2em";

	//display tax
	let tax = document.createElement("p");
    tax.textContent = "Tax: $" + (0.1 * sumOfPrices).toFixed(2);
	orderArrInfo.tax = (0.1 * sumOfPrices).toFixed(2);
    tax.style.fontSize = 15 + "px";
	tax.style.padding = "0 0 0 2em";

	//display order total
	orderTotal = (sumOfPrices + (0.1 * sumOfPrices) + restaurant.delivery_fee).toFixed(2);
	let total = document.createElement("p");
    total.textContent = "Order Total: $" + orderTotal;
	orderArrInfo.orderTotal = orderTotal;
    total.style.fontSize = 15 + "px";
	total.style.padding = "0 0 0 2em";

	container.appendChild(subtotal);
	container.appendChild(delivery);
	container.appendChild(tax);
	container.appendChild(total);
	
	console.log("in update Order");
}

//returns the total price of an item in an order
function totalPrice(unitNum, itemName){
	let temp = restaurant.menu;
	return (unitNum * getPrice(itemName));
}

//returns price of specific item in menu
function getPrice(itemName){
	let temp = restaurant.menu;

	for (const category in temp){ 
		for(const item in temp[category]){
			if(temp[category][item].name === itemName){
				return temp[category][item].price;
			}
		}
	}
}

//even though small, this function can be used in the future when actually submitting an order (server)
function submitOrder(){
	let req = new XMLHttpRequest();
    let url = "http://localhost:3000/orders";
    req.open("POST",url);
    req.setRequestHeader("Content-Type", "application/json");
	let obj = {name: restaurant.name, array: orderArr, orderInfo: orderArrInfo}
	console.log(orderArr);
    let data = JSON.stringify(obj);
    req.send(data);

	orderArr = [];
	alert("Order Submitted!");
	window.location.href = window.location.href;
}

//even though small, this function can be used in the future when actually clearing an order (server)
function clearOrder(){
	orderArr = [];
}

//prints menu column title
function printMenuTitle(){
	let container = document.getElementById("menuColumn");
	container.innerHTML = "";

	//titles of the columns
	let menuCol = document.createElement('p');
	menuCol.textContent = "Menu";
	menuCol.style.fontSize = 30 + "px";
	menuCol.style.textAlign = "center";
	menuCol.style.font = "italic bold 20px arial,serif";
	container.appendChild(menuCol);
}

//prints category column title
function printCategoryTitle(){
	let container = document.getElementById("categoriesColumn");
	container.innerHTML = "";

	//titles of the columns
	let catCol = document.createElement('p');
	catCol.textContent = "Category";
	catCol.style.fontSize = 30 + "px";
	catCol.style.textAlign = "center";
	catCol.style.font = "italic bold 20px arial,serif";
	container.appendChild(catCol);
}

//prints order column title
function printOrderTitle(){
	let container = document.getElementById("orderColumn");
	container.innerHTML = "";

	//titles of the columns
	let orderCol = document.createElement('p');
	orderCol.textContent = "Order";
	orderCol.style.fontSize = 30 + "px";
	orderCol.style.textAlign = "center";
	orderCol.style.font = "italic bold 20px arial,serif";
	container.appendChild(orderCol);
}