// Background Image Stuff
chrome.runtime.getPackageDirectoryEntry(function (root) {
	root.getDirectory("wallpapers", {}, function (dirEntry) {
		dirEntry.createReader().readEntries(function (entries) {
			if (!entries.length) {
				document.body.style.backgroundImage = "url('assets/IMG/Yasir.png')";
			}
			image = entries[Math.floor(Math.random() * entries.length)];
			document.body.style.backgroundImage = "url(" + "wallpapers/" + image.name + ")";
		});
	});
});


// clock stuff
(function () {
	const hourHand = document.querySelector('.hourHand');
	const minuteHand = document.querySelector('.minuteHand');
	const secondHand = document.querySelector('.secondHand');
	const time = document.querySelector('.time');
	const clock = document.querySelector('.clock');
	const audio = document.querySelector('.audio');
	function setClockTick() {

		const today = new Date();
		const second = today.getSeconds();
		const secondDeg = ((second / 60) * 360);
		secondHand.style.transform = `rotate(${secondDeg}deg)`;


		const minute = today.getMinutes();
		const minuteDeg = ((minute / 60) * 360);
		minuteHand.style.transform = `rotate(${minuteDeg}deg)`;


		const hour = today.getHours();
		const hourDeg = ((hour / 12) * 360);
		hourHand.style.transform = `rotate(${hourDeg}deg)`;

		time.innerHTML = '<span>' + '<strong>' + hour + '</strong>' + ' : ' + minute + ' : ' + '<small>' + second + '</small>' + '</span>';

	}
	setClockTick();
	setInterval(setClockTick, 1000);
	chrome.storage.sync.get({ 'sound': true }, function (data) {
		if (data.sound) {
			audio.play();
			clock.addEventListener('click',()=>audio.paused?audio.play():audio.pause());
		}
	});

})();



// quotes section
const text = document.getElementById("_quote");
const author = document.getElementById("_author");
const indx = Math.floor(Math.random() * allQuotes.length);
const quote = allQuotes[indx].text;
const auth = allQuotes[indx].author;
text.innerHTML = quote;
author.innerHTML = (auth == null)? "Anonymous":auth;



