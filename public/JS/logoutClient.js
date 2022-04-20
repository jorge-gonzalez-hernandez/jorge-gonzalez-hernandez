
function logout(){
    let req = new XMLHttpRequest();
    let url = "http://localhost:3000/logout";
    req.open("POST",url);
    req.setRequestHeader("Content-Type", "application/json");
	let obj = {loggedin: false};
	let data = JSON.stringify(obj);
    req.send(data);

    window.location.href = "http://localhost:3000/";
    alert("Logged out");
}