//////////////////////////
// * GLOBAL VARIABLES * //
//////////////////////////

// SPIKE PRIME INTERACTION GLOBAL VARIABLES
var mySPIKE1 = null;
var mySPIKE2 = null;
var mySPIKE_reward = null;
var mySPIKE_game = null;
var left_motor = null; // player 1 controls (mySPIKE_game hub)
var right_motor = null; // player 2 controls (mySPIKE_game hub)

function player1_reward() {
	// if player 1 (left) wins, execute program in slot 2 on reward SPIKE
	if (mySPIKE_reward.isActive()) { mySPIKE_reward.executeProgram(2); }
	else { alert('must activate Reward SPIKE Prime'); }
}
function player2_reward() {
	// if player 2 wins, execute program in slot 1 on reward SPIKE
	if (mySPIKE_reward.isActive()) { mySPIKE_reward.executeProgram(1); }
	else { alert('must activate Reward SPIKE Prime'); }
}
function player1_punishment() {
	// if player 1 loses, execute program in slot 0 on SPIKE 1
	if (mySPIKE1.isActive()) { mySPIKE1.executeProgram(0); }
	else { alert('must activate Player 1 SPIKE Prime'); }
}

function player2_punishment() {
	// if player 2 loses, execute program in slot 0 on SPIKE 2
	if (mySPIKE2.isActive()) { mySPIKE2.executeProgram(0); }
	else { alert('must activate Player 2 SPIKE Prime'); }
}

// REACTION GAME GLOBAL VARIABLES

var items = Array('images/skull.png', 'images/ghost.webp', 'images/zombie.png',
'images/pumpkin.webp', 'images/kirby.webp', 'images/Hollowknight.png');
var item_list = null; // this will hold a temp copy of the items each time game is played
var image_ref = null;
var image_match = null;

var speed = 1000; // number of milliseconds to flash image options
var min_wait = 5; // minimum number of images to show before showing match
var max_wait = 10; // maximum number of images to show before showing match
var wait_count = 0; // number left (countdown) of non-matches to show (set when game starts, reset when match shown)

var interrupt = false; // if the game play has been interrupted (e.g. by user pushing a button, for instance)
var monitor_user_speed = 10; // how fast, in ms, to monitor the user input
var motor_threshold = 10; // how far the motor needs to turn

// once the DOM is loaded, set up the global variables
window.onload = function() {
	// setup SPIKE Prime Hub Connections:
	mySPIKE1 = document.getElementById("service_SPIKE1").getService();
	mySPIKE2 = document.getElementById("service_SPIKE2").getService();
	mySPIKE_reward = document.getElementById("service_SPIKE3").getService();
	mySPIKE_game = document.getElementById("service_SPIKE4").getService();

	// when SPIKE Primes are activated (via the SPIKE Prime Service Dock), init variables
	mySPIKE_game.executeAfterInit(async function() {
		left_motor = new mySPIKE_game.Motor("E");
		right_motor = new mySPIKE_game.Motor("F");
		if (mySPIKE_game.isActive()) { mySPIKE_game.executeProgram(0); }
		else { alert('must activate main SPIKE Prime'); }
	});

	// setup reaction game specific variables
	image_ref = document.getElementById("image_ref");
	image_match = document.getElementById("image_match");
}

/////////////////////////////
// * INTERFACE FUNCTIONS * //
/////////////////////////////

// INTERFACE FUNCTIONS

// toggle display (show or not) of the controls
function hideControls() {
	var controls = document.getElementById("controls");
	if (controls.style.display === "none") { controls.style.display = "block"; }
	else { controls.style.display = "none"; }
}
// display hardware setup instructions!
function setupInfo() {
	var alert_text = "** Hardware Setup: **\n";
	alert_text += "Player 1: Color on A\n"
	alert_text += "Player 2: Color on B\n"
	alert_text += "Punishment in Slot 0 of both punishment hubs\n"
	alert_text += "Reward Hub: Player 1 Reward (left) in Slot 2, Player 2 (right) Reward in Slot 1\n"
	alert(alert_text)
}

////////////////////////////
// * GAMEPLAY FUNCTIONS * //
////////////////////////////

// GAME FUNCTIONS

// if they hit the play button


// Later add hub reaction ability
function play() {
	item_list = items.slice(); // create copy by value, leaving original list intact
	// THIS LINE:
	// - determines a random item in the list (random index based on length of list)
	// - uses SPLICE to remove that item from the list, setting it to be the reference item
	// - updates item_list (remove in place) as a new list of all other items OTHER than reference
	var reference_item = item_list.splice(Math.floor(Math.random()*item_list.length), 1);
	image_ref.src = reference_item; // display reference item

	interrupt = false;	// set this to be false (meaning game is playing, no one has clicked yet)
	result_display('',''); // clear any previous results being shown
	set_wait_count();	// set up the number of times to show non-matches

	var score = [0,0];
	var result = null;

	game();

	if (score[0] > score[1]) {
		if (mySPIKE_game.isActive()) { mySPIKE_reward.executeProgram(2); }
		else { alert('must activate main SPIKE Prime'); }

		if (mySPIKE1.isActive()) { mySPIKE1.executeProgram(0); }
		else { alert('must activate left Punishment SPIKE Prime'); }
	}
	else if (score[1] > score[0]) {
		if (mySPIKE_game.isActive()) { mySPIKE_reward.executeProgram(1); }
		else { alert('must activate main SPIKE Prime'); }

		if (mySPIKE1.isActive()) { mySPIKE2.executeProgram(0); }
		else { alert('must activate right Punishment SPIKE Prime'); }
	}

	// show_random_item();	// start showing random items
	// monitor_users();	// start monitoring the inputs
}


function game() {
	console.log("game");
	var state = '';
	var left_motor_pos = left_motor.get_position();
	var right_motor_pos = right_motor.get_position();
	// while ((left_motor_pos < 10) && right_motor_pos < 10)
	// {
	// 	left_motor_pos = left_motor.get_position();
	// 	right_motor_pos = right_motor.get_position();

	// console.log(wait_count);

	// 	if (wait_count == 0) {
	// 		// add function here to do a seperate thing, waiting, when img in final image

	// 		// have show enough random images
	// 		// time to show a match
	// 		image_match.src = image_ref.src; // they now match!
	// 		state = 'win';
	// 	}
	// 	else {
	// 		state = 'loss';
	// 		// keep selecting a random image
	// 		var item = item_list[Math.floor(Math.random()*item_list.length)];
	// 		image_match.src = item;
	// 		// decrement wait count
	// 		wait_count = wait_count - 1;
	// 	}
		show_random_item();
		monitor_users();	// start monitoring the inputs

		// console.log('in daa while lloooopp');
		console.log(left_motor_pos);
		console.log(right_motor_pos);
	// }
	console.log('out da loop');
	console.log(left_motor_pos);
	console.log(right_motor_pos);

	if (state == 'loss') {
		if ((Math.abs(left_motor_pos) < 10)) {
		result = 2;
		}
		else {
			result = 3;
		}
	}
	else if (state == 'win') {
		if ((Math.abs(left_motor_pos) < 10)) {
			result = 0;
		}
		else {
			result = 1;
		}
	}
}


// set up (initialize) the wait_count variable
function set_wait_count() {
	console.log('finding wait count')
	// does a "Getting a random integer between two values, inclusive"
	// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	var min = Math.ceil(min_wait);
	var max = Math.floor(max_wait);
	// The maximum is inclusive and the minimum is inclusive
	wait_count = Math.floor(Math.random() * (max - min + 1) + min);
}

// uses item_list to show random item
function show_random_item() {
	if (interrupt) { return; }
	else {
		if (wait_count == 0) {
			// add function here to do a seperate thing, waiting, when img in final image

			// have show enough random images
			// time to show a match
			image_match.src = image_ref.src; // they now match!

			// reset wait count;
			// set_wait_count();
		} else {
			// keep selecting a random image
			var item = item_list[Math.floor(Math.random()*item_list.length)];
			image_match.src = item;
			// decrement wait count
			wait_count = wait_count - 1;
		}
		// check interrupt again, JUST in case it happened while switching images
		if (!interrupt) {
			// keep showing random items
			setTimeout(show_random_item, speed);
		}
	}
}



// monitor users
function monitor_users() {
	if (interrupt) { return; } // if there has been an interrupt, then stop
	var left_motor_pos = 0; var right_motor_pos = 0; // default values

	// get user values (null check is to make sure it was initialized
	if (left_motor != null) { left_motor_pos = left_motor.get_position(); }
	if (right_motor != null) { right_motor_pos = right_motor.get_position(); }

	// check if motor position has changes
	if (left_motor_pos > Math.abs(motor_threshold)) { interrupt = true; end_game(1); return; }
	if (right_motor_pos > Math.abs(motor_threshold)) { interrupt = true; end_game(2); return; }

	// keep showing random items
	setTimeout(monitor_users, monitor_user_speed); // set timeout to check again
}
// figure out end game status
// - player_signal is which player "clicked"
function end_game(player_signal) {
	var result_color = "";
	var result_text = "";
	if (image_match.src == image_ref.src) {
		// then we have a match! user wins
		result_color = "LightGreen";
		result_text = "YES! Player " + player_signal + " was right!";
		// give reward
		if (player_signal == 1) { player1_reward(); }
		if (player_signal == 2) { player2_reward(); }
	} else {
		// the images do NOT match, so the user should NOT have clicked
		result_color = "LightSalmon";
		result_text = "Uh-oh. Player " + player_signal + " was WRONG!";
		// give punishment
		if (player_signal == 1) { player1_punishment(); }
		if (player_signal == 2) { player2_punishment(); }
	}
	result_display(result_color, result_text);
}

// display result
function result_display(color, text) {
	var resultarea = document.getElementById("resultrow");
	var resulttext = document.getElementById("result");
	resultarea.setAttribute("bgColor", color);
	resulttext.innerHTML = text;
}
// clear previous result
function result_clear() { result_display('', ''); }