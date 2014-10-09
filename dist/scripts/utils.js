/* --------
Utils.ts
Utility functions.
-------- */
var TSOS;
(function (TSOS) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.trim = function (str) {
            // Use a regular expression to remove leading and trailing spaces.
            // Replaces 1 or more spaces with the empty string ""
            return str.replace(/^\s+ | \s+$/g, "");
        };

        Utils.rot13 = function (str) {
            /*
            This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
            You can do this in three lines with a complex regular expression, but I'd have
            trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };

        Utils.getFormattedDate = function () {
            var date = new Date();

            var AMPM = (date.getHours() < 12) ? "AM" : "PM";
            var properHours = date.getHours() % 12;

            // Display 12 properly
            if (properHours == 0) {
                properHours += 12;
            }

            var dateString = _MONTH_NAMES[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " | ";

            if (properHours < 10) {
                dateString += "0";
            }
            dateString += properHours + ":";

            if (date.getMinutes() < 10) {
                dateString += "0";
            }
            dateString += date.getMinutes() + ":";

            if (date.getSeconds() < 10) {
                dateString += "0";
            }
            dateString += date.getSeconds() + " " + AMPM;

            return dateString;
        };

        // Convert hex strings to uppercase if user input them with lowercase letters
        Utils.toUpperHex = function (hexString) {
            var newString = "";

            for (var i = 0; i < hexString.length; i++) {
                // Letter
                if (hexString[i].match(/[a-zA-Z]/g)) {
                    newString += hexString[i].toUpperCase();
                } else {
                    newString += hexString[i];
                }
            }

            return newString;
        };
        return Utils;
    })();
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
