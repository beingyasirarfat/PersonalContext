// Define the clock-related functions
function setClockTick() {
	const today = new Date();
	const [second, minute, hour] = [today.getSeconds(), today.getMinutes(), today.getHours()];

	secondHand.style.transform = `rotate(${(second / 60) * 360}deg)`;
	minuteHand.style.transform = `rotate(${(minute / 60) * 360}deg)`;
	hourHand.style.transform = `rotate(${(hour / 12) * 360}deg)`;

	digitalTime.innerHTML = `<span><strong>${hour}</strong>:${minute} :<small>${second}</small></span>`;
}

// Define the clock sound toggle function
function toggleClockSound() {
	const ticking = document.getElementById("clockSound");
	const newState = ticking.paused;
	newState ? ticking.play() : ticking.pause();
	chrome.storage.local.set({ clockTicking: newState });
}

function timeDifference(initialTime, targetTime) {
	initialTime = new Date(initialTime);
	targetTime = new Date(targetTime);
	let years = targetTime.getFullYear() - initialTime.getFullYear();
	let months = targetTime.getMonth() - initialTime.getMonth();
	if (months < 0) {
		years--;
		months += 12;
	}

	let days = targetTime.getDate() - initialTime.getDate();
	if (days < 0) {
		months--;
		days += 30.436875; // Average days in a month
	}

	let hours = targetTime.getHours() - initialTime.getHours();
	if (hours < 0) {
		days--;
		hours += 24;
	}

	let minutes = targetTime.getMinutes() - initialTime.getMinutes();
	if (minutes < 0) {
		hours--;
		minutes += 60;
	}
	// take care of fractional values
	minutes = Math.floor(minutes);
	hours = Math.floor(hours);
	days = Math.floor(days);
	months = Math.floor(months);
	years = Math.floor(years);

	return { years, months, days, hours, minutes };
}

// Define the function to calculate and display age
function elapsedTime(initialTime) {
	const { years, months, days, hours, minutes } = timeDifference(initialTime, new Date());
	document.getElementById("elapsedTime").innerHTML = `<b>${years} : ${months} : ${days}<br>${hours} : ${minutes}</b>`;
}

// Define the function to calculate and display remaining time
function remainingTime(targetTime) {
	const { years, months, days, hours, minutes } = timeDifference(new Date(), targetTime);
	// Display the remaining time in the desired format
	document.getElementById(
		"timeRemaining",
	).innerHTML = `<b>${years} : ${months} : ${days}<br>${hours} : ${minutes}</b>`;
}

function getTimeInput(callback) {
	const [picker, input] = ["datetimePicker", "datetimePickerInput"].map((id) => document.getElementById(id));
	[picker.style.display, input.style.display] = ["", ""];
	input.focus();
	input.addEventListener("focusout", () => {
		[picker.style.display, input.style.display] = ["none", "none"];
		if (isNaN(Date.parse(input.value))) {
			return alert("Invalid Date and Time");
		}
		const newdatetime = new Date(input.value);
		callback(newdatetime);
		chrome.storage.local.set({
			[callback === elapsedTime ? "initialTime" : "targetTime"]: newdatetime.toISOString(),
		});
	});
}

(function () {
	// Element definitions
	const [hourHand, minuteHand, secondHand, digitalTime, clock, audio, elapsedTimeElement, remainingTimeElement] = [
		"hourHand",
		"minuteHand",
		"secondHand",
		"digitalTime",
		"clock",
		"clockSound",
		"elapsedTime",
		"timeRemaining",
	].map((id) => document.getElementById(id));
	audio.src = `/assets/clockSounds/${
		["chic", "click", "slash", "tick", "ticktac", "ticktock"][Math.floor(Math.random() * 6)]
	}.mp3`;

	// Set clock tick initially
	setClockTick();
	setInterval(setClockTick, 1000);

	// Set clock sound toggle functionality
	chrome.storage.local.get(
		{
			clockTicking: true,
			initialTime: new Date("May 08, 1997 00:00:00"),
			targetTime: new Date("May 08, 2027 00:00:00"),
		},
		({ clockTicking, initialTime, targetTime }) => {
			const initTime = isNaN(Date.parse(initialTime)) ? new Date("May 08, 1997 00:00:00") : new Date(initialTime);
			const tgtTime = isNaN(Date.parse(targetTime)) ? new Date("May 08, 2027 00:00:00") : new Date(targetTime);
			clockTicking ? audio.play() : audio.pause();
			clock.addEventListener("dblclick", toggleClockSound);
			elapsedTimeElement.addEventListener("dblclick", () => getTimeInput(elapsedTime));
			remainingTimeElement.addEventListener("dblclick", () => getTimeInput(remainingTime));
			elapsedTime(initTime);
			remainingTime(tgtTime);
		},
	);
})();
