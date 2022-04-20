
function handleChange(radio){
    console.log(radio.value);
    submitChange(radio.value);
}

function submitChange(value){
    let privacy;
    if(value == "private"){
        privacy = true;
    }
    else{
        privacy = false;
    }

    let req = new XMLHttpRequest();
    let url = window.location.href + "/changeprivacy";
    req.open("POST",url);
    req.setRequestHeader("Content-Type", "application/json");
	let obj = {private: privacy};
	let data = JSON.stringify(obj);
    req.send(data);
}