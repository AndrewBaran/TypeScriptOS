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
                if (hexString[i].match(/[a-fA-F]/g)) {
                    newString += hexString[i].toUpperCase();
                } else {
                    newString += hexString[i];
                }
            }

            return newString;
        };

        Utils.decimalToHex = function (decimalValue) {
            var returnString = "";

            for (var position = _MiscConstants.NUM_HEX_DIGITS - 1; position >= 0; position--) {
                for (var value = 15; value >= 0; value--) {
                    var subtractAmount = value * (Math.pow(16, position));

                    if (subtractAmount <= decimalValue) {
                        // Number fits into the decimal value
                        decimalValue -= subtractAmount;

                        // Convert value used to hex and concat to returnString
                        var valueString = value.toString(16);

                        returnString += valueString;

                        break;
                    }
                }
            }

            // Add 0x prefix
            returnString = "0x" + returnString;

            // Capitalize any hex digits
            returnString = Utils.toUpperHex(returnString);

            return returnString;
        };

        // Checks to see if a file name has the correct characters and size
        Utils.isValidFileName = function (fileName) {
            // Check if valid size
            // 60 bytes = 120 hex symbols allowed
            if (fileName.length > _FileConstants.DATA_SIZE) {
                return false;
            } else {
                var regEx = /[a-z|A-Z|0-9]/;

                for (var i = 0; i < fileName.length; i++) {
                    // Invalid character
                    if (!regEx.test(fileName[i])) {
                        return false;
                    }
                }

                return true;
            }
        };

        // Takes a string and converts it into a string of hex symbols
        Utils.stringToHex = function (inputString) {
            var outputString = "";

            for (var i = 0; i < inputString.length; i++) {
                var hexValue = inputString.charCodeAt(i).toString(16);

                outputString += hexValue;
            }

            return outputString;
        };
        return Utils;
    })();
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
