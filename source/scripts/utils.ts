/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {

            // Use a regular expression to remove leading and trailing spaces.
            // Replaces 1 or more spaces with the empty string ""
            return str.replace(/^\s+ | \s+$/g, "");
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static getFormattedDate(): string {

            var date = new Date();

            var AMPM : string = (date.getHours() < 12) ? "AM" : "PM";
            var properHours : number = date.getHours() % 12;

            // Display 12 properly
            if(properHours == 0) {
                properHours += 12;
            }

            var dateString : string = _MONTH_NAMES[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " | ";

            if(properHours < 10) {
                dateString += "0";
            }
            dateString +=  properHours + ":";

            if(date.getMinutes() < 10) {
                dateString += "0";
            }
            dateString += date.getMinutes() + ":";

            if(date.getSeconds() < 10) {
                dateString += "0";
            }
            dateString += date.getSeconds() + " " + AMPM;

            return dateString;
        }

        // Convert hex strings to uppercase if user input them with lowercase letters
        public static toUpperHex(hexString: string): string {

            var newString: string = "";

            // Loop through string
            for(var i: number = 0; i < hexString.length; i++) {

                // Letter
                if(hexString[i].match(/[a-zA-Z]/g)) {
                    newString += hexString[i].toUpperCase();
                }

                // Number
                else {
                    newString += hexString[i];
                }

            }

            return newString;
        }
    }
}
