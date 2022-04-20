let validLogIn;// holds if log in is valid

function login(){
    let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;

	if(!username || !password){
		alert("Please Enter Valid Info");
	}
	else{
		//resetAddPage();
		getExists(username, password);
	}
}

function submitLogin(userN, passW){
	console.log("in submit," + userN);
    let req = new XMLHttpRequest();
    let url = "http://localhost:3000/login";
    req.open("POST",url);
    req.setRequestHeader("Content-Type", "application/json");
	let obj = {username: userN, password: passW};
	let data = JSON.stringify(obj);
    req.send(data);

	// alert("Restaurant Submitted!");
	// resetAddPage();
	window.location.href = "http://localhost:3000/users/"+userN;
}

function getExists(username, password){
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			let existsOBJ = JSON.parse(req.responseText);
			validLogIn = existsOBJ.valid;
            console.log(validLogIn);
            if(!validLogIn){
                alert("Username Doesn't Exists");
            }else{
                submitLogin(username,password);
            }

		}
	}
	//read selected item in dropdown
	req.open("GET","http://localhost:3000/login/" + username);
	req.setRequestHeader("Accept", "application/json");
	//Accept: application/json;
	req.send();
}