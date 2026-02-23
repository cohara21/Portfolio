var clockInterval;
var clockIntervalDelay = 5000;

$(document).ready(function () {
    //document.addEventListener("mousemove", handleMouseMove);
    clockInterval = setInterval(handleclockInterval, clockIntervalDelay);
});

function handleclockInterval() {
    updateWatch();
}

/*function handleMouseMove(pointerEvent) {
    var horizontalRatio = pointerEvent.pageX / window.innerWidth;
    var verticalRatio = pointerEvent.pageY / window.innerHeight;

    var hours = Math.floor(horizontalRatio * 24);
    var minutes = Math.floor(verticalRatio * 60);

    var date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    updateWatch(date);
} */

function updateWatch(date = null) {
    if (date == null) {
        date = new Date();
    }

    $(".letter").removeClass("letterOn");

    var minutes = date.getMinutes();
    var hours = date.getHours();
    var singleMinute = minutes == 1 || (minutes > 30 && (60 - minutes) == 1);

    if (minutes <= 30) {
        switchLettersOnFor("wordItIs");
    } else {
        switchLettersOnFor("wordThereIs");
    }

    if (minutes == 0) {
        switchLettersOnFor("wordOclock");
    } else if (minutes <= 30) {
        if (singleMinute) {
            switchLettersOnFor("wordMinute");
        } else {
            switchLettersOnFor("wordMinutes");
        }
        switchLettersOnFor("minute" + minutes);
        switchLettersOnFor("wordPast");
    } else {
        var untilMinutes = 60 - minutes;
        if (singleMinute) {
            switchLettersOnFor("wordMinute");
        } else {
            switchLettersOnFor("wordMinutes");
        }
        switchLettersOnFor("minute" + untilMinutes);
        switchLettersOnFor("wordUntil");
        hours = addOneToHours(hours);
    }

    switchLettersOnFor("hour" + hours);

    if (hours == 12 && minutes == 0) {
        switchLettersOnFor("hourNoon");
        return;
    } else if (hours == 0 && minutes == 0) {
        switchLettersOnFor("hourMidnight");
        return;
    }

    if (hours >= 0 && hours < 12) {
        switchLettersOnFor("wordMorning");
        switchLettersOnFor("wordInThe");
    } else if (hours >= 12 && hours < 17) {
        switchLettersOnFor("wordAfternoon");
        switchLettersOnFor("wordInThe");
    } else if (hours >= 17 && hours < 20) {
        switchLettersOnFor("wordEvening");
        switchLettersOnFor("wordInThe");
    } else {
        switchLettersOnFor("wordNight");
        switchLettersOnFor("wordAt");
    }

    console.log("Time:", hours, minutes);
}

function addOneToHours(hours) {
    if (hours < 23) {
        hours++;
    } else {
        hours = 0;
    }
    return hours;
}

function switchLettersOnFor(word) {
    $("." + word).addClass("letterOn");
}
