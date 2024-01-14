// Define the clock-related functions
function setClockTick() {
  const today = new Date();
  const second = today.getSeconds();
  const secondDeg = (second / 60) * 360;
  secondHand.style.transform = `rotate(${secondDeg}deg)`;

  const minute = today.getMinutes();
  const minuteDeg = (minute / 60) * 360;
  minuteHand.style.transform = `rotate(${minuteDeg}deg)`;

  const hour = today.getHours();
  const hourDeg = (hour / 12) * 360;
  hourHand.style.transform = `rotate(${hourDeg}deg)`;
  digitalTime.innerHTML = `<span><strong> ${hour}</strong>: ${minute} : <small> ${second} </small></span>`;
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
  const { years, months, days, hours, minutes } = timeDifference(
    initialTime,
    new Date()
  );
  document.getElementById(
    "elapsedTime"
  ).innerHTML = `<b>${years} : ${months} : ${days}<br>${hours} : ${minutes}</b>`;
}

// Define the function to calculate and display remaining time
function remainingTime(targetTime) {
  const { years, months, days, hours, minutes } = timeDifference(
    new Date(),
    targetTime
  );
  // Display the remaining time in the desired format
  document.getElementById(
    "timeRemaining"
  ).innerHTML = `<b>${years} : ${months} : ${days}<br>${hours} : ${minutes}</b>`;
}

function getTimeInput(callback) {
  const datetimePicker = document.getElementById("datetimePicker");
  const datetimePickerInput = document.getElementById("datetimePickerInput");
  datetimePicker.style.display = "";
  datetimePickerInput.style.display = "";
  datetimePickerInput.focus();
  datetimePickerInput.addEventListener("focusout", () => {
    datetimePicker.style.display = "none";
    datetimePickerInput.style.display = "none";
    const newdatetime = new Date(datetimePickerInput.value);
    if (isNaN(newdatetime.getDate())) return alert("Invalid Date and Time");
    callback(newdatetime);
    callback === elapsedTime
      ? chrome.storage.local.set({ initialTime: newdatetime.toISOString() })
      : chrome.storage.local.set({ targetTime: newdatetime.toISOString() });
  });
}

(function () {
  // Element definitions
  const hourHand = document.getElementById("hourHand");
  const minuteHand = document.getElementById("minuteHand");
  const secondHand = document.getElementById("secondHand");
  const time = document.getElementById("digitalTime");
  const clock = document.getElementById("clock");
  const audio = document.getElementById("clockSound");
  const elapsedTimeElement = document.getElementById("elapsedTime");
  const remainingTimeElement = document.getElementById("timeRemaining");
  const datetimePicker = document.getElementById("datetimePicker");

  // set random clock sound from assets/audio/clockSounds
  const sounds = [
    "chic.mp3",
    "click.mp3",
    "slash.mp3",
    "tick.mp3",
    "ticktac.mp3",
    "ticktock.mp3",
  ];
  audio.src = `/assets/clockSounds/${
    sounds[Math.floor(Math.random() * sounds.length)]
  }`;

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
    function (data) {
      let initialTime = isNaN(Date.parse(data.initialTime))
        ? new Date("May 08, 1997 00:00:00")
        : new Date(data.initialTime);
      let targetTime = isNaN(Date.parse(data.targetTime))
        ? new Date("May 08, 2027 00:00:00")
        : new Date(data.targetTime);
      data.clockTicking == true ? audio.play() : audio.pause();
      clock.addEventListener("dblclick", () => {
        toggleClockSound();
      });
      elapsedTimeElement.addEventListener("dblclick", () => {
        getTimeInput(elapsedTime);
      });

      remainingTimeElement.addEventListener("dblclick", () => {
        getTimeInput(remainingTime);
      });

      elapsedTime(initialTime);
      remainingTime(targetTime);
    }
  );
})();
