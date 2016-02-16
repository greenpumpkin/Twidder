/*
 * Authors:
 * Cindy Najjar
 * Jan Yvonnig
 */

var sizeMinPwd = 6;
var maxSizeMsg = 300;

displayView = function() {
	if (localStorage.getItem("token") == null) {
		document.getElementById("page").innerHTML = document.getElementById("welcomeview").innerHTML;
	} else {
		document.getElementById("page").innerHTML = document.getElementById("profileview").innerHTML;
	}
};

window.onload = function() {
	displayView();
	if (localStorage.getItem("token") != null) {
		displayInfo();
		keepMsg("mess");
	}	
};

/********************** Login, Sign up, Log out **********************/

logIn = function() {
	var username = document.getElementById("emailLog").value;
	var password = document.getElementById("passwordLog").value;
	if (password.length >= sizeMinPwd) {
		var servStubLog = serverstub.signIn(username, password);
		if (servStubLog.success == true) {
			localStorage.setItem("token", servStubLog.data);
			location.reload();
		} else {
			displayMsg(servStubLog.message, false, "welcomeview");
		}
	} else {
		displayMsg("Username or password is incorrect",false,"welcomeview");
	}
};

logOut = function() {
	var token = localStorage.getItem("token");

	if (token != null) {
		var servStubLogOut = serverstub.signOut(token);
		localStorage.removeItem("token");
	}

	//to display the welcome page after the user signs out
	location.reload();
};

signUp = function() {
	var genderSelected = "male";
	if (document.getElementById("female").selected == true) {genderSelected = "female";}

	var newUser = {
		'email': document.getElementById("emailSign").value,
		'password': document.getElementById("passwordSign").value,
		'firstname': document.getElementById("firstName").value,
		'familyname': document.getElementById("familyName").value,
		'gender': genderSelected,
		'city': document.getElementById("city").value,
		'country': document.getElementById("country").value
	};

	if (!(newUser.password.length < sizeMinPwd) && (newUser.password == document.getElementById("repeatPassword").value)) {
		var servStubSign = serverstub.signUp(newUser);
		displayMsgSign(servStubSign.message,true);
	} else if (newUser.password != document.getElementById("repeatPassword").value) {
        displayMsgSign("Error: both passwords must be identical", false);
	} else if (newUser.password.length < sizeMinPwd) {
        displayMsgSign("Error: password must be at least 6 characters long", false);
	}
};


/********************** Shows an error or a success message **********************/
//message : the message which will be displayed,
//success : boolean (true : info message / false : error message),
//view : in which view the message will be displayed
displayMsg = function(message,success,view) {

	var errFrame = document.getElementById("displayMsg");

	if (view == "profileview") {
		errFrame = document.getElementById("displayMsgProfile");
	}

	errFrame.style.display = "block";
	errFrame.innerHTML = message;
	errFrame.style.backgroundColor = "white";
	
	if (success == false) {
		errFrame.style.border = "1px solid red";
	}
		
	else if (success == true) {
		errFrame.style.border = "1px solid black";
	}

	setTimeout(function () {
		errFrame.style.display = "none";
	}, '3000');

};


/********************** Displays the panel of the tab parameter **********************/
tabClicked = function(tab) {
	if (tab == 'home') {
		document.getElementById("home-panel").style.display = "block";
		document.getElementById("account-panel").style.display = "none";
		document.getElementById("browse-panel").style.display = "none";
	} else if (tab == 'account') {
		document.getElementById("account-panel").style.display = "block";
		document.getElementById("home-panel").style.display = "none";
		document.getElementById("browse-panel").style.display = "none";
	} else if (tab == 'browse') {
		document.getElementById("browse-panel").style.display = "block";
		document.getElementById("account-panel").style.display = "none";
		document.getElementById("home-panel").style.display = "none";
		document.getElementById("userPage").style.display = "none";

		if (document.getElementById("searchForm").style.display == "none") {
			document.getElementById("searchForm").style.display = "block";
			document.getElementById("mailSearch").value = "";
		}
	}
};

/********************** Enables a user to change his password **********************/
changePwd = function() {
	var token = localStorage.getItem("token");
	var oldPassword = document.getElementById("oldPwd").value;
	var newPassword = document.getElementById("chgPwd").value;

	if (newPassword.length >= sizeMinPwd) {
		var servStubChg = serverstub.changePassword(token, oldPassword, newPassword);

        if (document.getElementById("chgPwd").value != document.getElementById("chgRepPwd").value) {
            displayMsg("Error: both passwords must be identical", false, "profileview");
        } else {
            displayMsg(servStubChg.message, true, "profileview");
        }
	} else {
		displayMsg("Error: password must be at least 6 characters long", false, "profileview");
	}
};

/********************** Displays all the info about the user who is logged in **********************/
displayInfo = function() {
	var token = localStorage.getItem("token");
	var servStubInfo = serverstub.getUserDataByToken(token);

	document.getElementById("mail-span").innerHTML = servStubInfo.data.email;
	document.getElementById("firstname-span").innerHTML = servStubInfo.data.firstname;
	document.getElementById("familyname-span").innerHTML = servStubInfo.data.familyname;
	document.getElementById("gender-span").innerHTML = servStubInfo.data.gender;	
	document.getElementById("city-span").innerHTML = servStubInfo.data.city;
	document.getElementById("country-span").innerHTML = servStubInfo.data.country;
};

/********************** Stores the "msg" send by "from" in the array **********************/
send = function(msg,from,to) {
    
    var token = localStorage.getItem("token");
    var servStubPost = serverstub.postMessage(token,msg,from);
	if(servStubPost.success == true) {
		document.getElementById(to).value = "";
		displayMsg(servStubPost.message, true, "profileview");
		if (to == "mess") {
        	keepMsg("mess");
    	} else if (to == "messUser") {
    		keepMsg("messUser");
    	}
	} else {
        displayMsg(servStubPost.message, false, "profileview");
    }
};

/********************** Enables a user to post a message to a wall **********************/
msgOnWall = function(to) {

	var token = localStorage.getItem("token");
	var msg = document.getElementById(to).value;
	var email = document.getElementById("mail-span-o").innerHTML;
	var servStubData;

    if ((msg.length <= maxSizeMsg) && (msg.length > 0)) {
        
        if (to == "mess") {
        	servStubData = serverstub.getUserDataByToken(token);
        } else if (to == "messUser") {
        	servStubData = serverstub.getUserDataByEmail(token, email);
        }

    	if (servStubData.success == true) {
            send(msg, servStubData.data.email,to);
        	displayMsg(servStubData.message, true, "profileview");
        } else {
            displayMsg(servStubData.message, false, "profileview");
        }
    } else {
        displayMsg("Message too short or too long", false, "profileview");
    }
};

/********************** Updates the wall to
              make sure that the messages will appear within it **********************/
keepMsg = function(to) {

	var messageArea = document.getElementById(to);
	var token = localStorage.getItem("token");
	var email = document.getElementById("mail-span-o").innerHTML;
	var txt;

	if (to == "mess") {
		txt = serverstub.getUserMessagesByToken(token);
	} else if (to == "messUser") {
		txt = serverstub.getUserMessagesByEmail(token,email);
	}

	var mess = txt.data;
	
	if (messageArea && txt) {
		/* if the textarea isn't empty and the user has posted messages */
        var wall;

        if (to == "mess") {
        	wall = document.getElementById("wall");
        } else if (to == "messUser") {
        	wall = document.getElementById("wallUser");
        }
		//Removing all the messages ...
        while (wall.firstChild) {
    			wall.removeChild(wall.firstChild);
		}
        //...and rewriting them all	to be sure they're all in the wall
        for	(j = 0; j < mess.length; j++) {
        	var para = document.createElement("p");
	        var msg = document.createTextNode("'"+mess[j].content+"' written by "+mess[j].writer);
	        para.appendChild(msg);
	        wall.appendChild(para);
        }

    } else {
        displayMsg("Error", false, "profileview");
    }
};

/********************** Builds the info of an other user **********************/
displayInfoOther = function(email) {
	var token = localStorage.getItem("token");
	var servStubInfo = serverstub.getUserDataByEmail(token,email);

	document.getElementById("mail-span-o").innerHTML = servStubInfo.data.email;
	document.getElementById("firstname-span-o").innerHTML = servStubInfo.data.firstname;
	document.getElementById("familyname-span-o").innerHTML = servStubInfo.data.familyname;
	document.getElementById("gender-span-o").innerHTML = servStubInfo.data.gender;	
	document.getElementById("city-span-o").innerHTML = servStubInfo.data.city;
	document.getElementById("country-span-o").innerHTML = servStubInfo.data.country;
};

/********************** Enables to search for another user's wall **********************/
searchSomeone = function() { 
	var token = localStorage.getItem("token");
	var email = document.getElementById("mailSearch").value;
	var servStubData = serverstub.getUserMessagesByEmail(token, email);
	if (servStubData.success == true) {
		displayInfoOther(email);
		loadUserPage();
	} else {
		displayMsg(servStubData.message, false, "profileview");
		document.getElementById("searchForm").style.display = "block";
		document.getElementById("userPage").style.display = "none";
	}
};

/********************** Enables to display all the info of another user **********************/
loadUserPage = function() {
	document.getElementById("searchForm").style.display = "none";
	document.getElementById("userPage").style.display = "block";
	keepMsg("messUser");
};

/********************** Displays message near the login form **********************/
displayMsgSign = function(message,success) {

	var	errFrame = document.getElementById("displayMsgSignUp");

	errFrame.style.display = "block";
	errFrame.innerHTML = message;
	errFrame.style.backgroundColor = "white";

	if (success == false) {
		errFrame.style.border = "1px solid red";
	}

	else if (success == true) {
		errFrame.style.border = "1px solid black";
	}

	setTimeout(function () {
		errFrame.style.display = "none";
	}, '3000');

};