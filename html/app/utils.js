/*
 * Misc util functions
 */

function nsecsToString(nsecs, showms) {
    if (nsecs < 0 || nsecs >= 18446744073709552000) {
        nsecs = 0;
    }

    var seconds = Math.floor(nsecs / 1e9);
    var mseconds = Math.round((nsecs / 1e6) % 1e3);

    var minutes = Math.floor(seconds/60);
    seconds = seconds % 60;

    var hours = Math.floor(minutes/60);
    minutes = minutes % 60

    var text = (hours > 0 ? hours + ":" : "") + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    if (typeof showms != "undefined" && showms) {
        // missing sprintf :P
        if (mseconds >= 100) {
            text = text + "." + mseconds;
        } else if (mseconds >= 10) {
            text = text + ".0" + mseconds;
        } else if (mseconds > 10) {
            text = text + ".00" + mseconds;
        }
    }
    return text;
}

function dumpObject(obj) {
    var output = '';
    for (property in obj) {
        output += property + ': ' + obj[property] + "\n";
    }
    console.log(output);
}
