let validReg; //stores if registration is valid or not

function register(){
    let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;

	if(!username || !password){
		alert("Please Enter Valid Info");
	}
	else{
		//resetAddPage();
		getValid(username, password);
	}
}

function submitRegister(userN, passW){
    let req = new XMLHttpRequest();
    let url = "http://localhost:3000/registration";
    req.open("POST",url);
    req.setRequestHeader("Content-Type", "application/json");
	let obj = {username: userN, password: passW};
	let data = JSON.stringify(obj);
    req.send(data);

	// alert("Restaurant Submitted!");
	// resetAddPage();
	window.location.href = "http://localhost:3000/users/" + userN;
}

function getValid(username, password){
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			let validOBJ = JSON.parse(req.responseText);
			validReg = validOBJ.valid;
            console.log(validReg);
            if(!validReg){
                alert("Username Already Exists");
            }else{
                submitRegister(username,password);
            }

		}
	}
	//read selected item in dropdown
	req.open("GET","http://localhost:3000/registration/" + username);
	req.setRequestHeader("Accept", "application/json");
	//Accept: application/json;
	req.send();
}