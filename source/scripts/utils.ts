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
                if(hexString[i].match(/[a-fA-F]/g)) {
                    newString += hexString[i].toUpperCase();
                }

                // Number
                else {
                    newString += hexString[i];
                }

            }

            return newString;

        } // toUpperHex()

        // Converts a decimal value to a string of the hex representation
        public static decimalToHex(decimalValue: number): string {

            var returnString: string = "";

            for(var position: number = _MiscConstants.NUM_HEX_DIGITS - 1; position >= 0; position--) {

                for(var value: number = 15; value >= 0; value--) {

                	var subtractAmount: number = value * (Math.pow(16, position));

                	if(subtractAmount <= decimalValue) {

                		// Number fits into the decimal value
                		decimalValue -= subtractAmount;

                		// Convert value used to hex and concat to returnString
                		var valueString: string = value.toString(16);

                		returnString += valueString;

                		break;
                	}

                } // Inner for

            } // Outer for

            // Add 0x prefix
            returnString = "0x" + returnString;

            // Capitalize any hex digits
            returnString = Utils.toUpperHex(returnString);

            return returnString;

        } // decimalToHex()

        // Checks to see if a file name has the correct characters and size
        public static isValidFileName(fileName: string): boolean {

            // Check if valid size
            // 60 bytes = 120 hex symbols allowed
            if(fileName.length > _FileConstants.DATA_SIZE) {
                return false;
            }

            else {

                var regEx = /[a-z|A-Z|0-9]/;

                for(var i: number = 0; i < fileName.length; i++) {

                    // Invalid character
                    if(!regEx.test(fileName[i])) {
                        return false;
                    }
                }

                return true;
            }
            
        } // isValidFileName()

        // Takes a string and converts it into a string of hex symbols
        public static stringToHex(inputString: string): string {

            var outputString: string = "";

            // Parse each character (1 byte), turning it into two hex symbols
            for(var i: number = 0; i < inputString.length; i++) {

                var hexValue: string = inputString.charCodeAt(i).toString(16);

                outputString += hexValue;
            }

            return outputString;

        } // stringToHex()

        public static isHex(inputString: string): boolean {

            var regex = /[a-f|A-F|0-9]/;
            var isValid: boolean = true;

            if(inputString.length !== 0) {

                for(var i: number = 0; i < inputString.length; i++) {

                    if(!regex.test(inputString[i])) {
                        isValid = false;
                        break;
                    }
                }
            }

            else {
                return false;
            }

            console.log("Is " + inputString + " valid: " + isValid);

            return isValid;

        } // isHex()

        // Takes in a string of hex symbols and returns a string with the corresponding character values
        public static hexToString(inputString: string): string {

            // Parse two hex values at a time, turning them into characters
            var index: number = 0;
            var currentSymbols: string = "";
            var characterValue: number = 0;
            var correctCharacter: string = "";

            var outputString: string = "";
            var errorOccured: boolean = false;

            while((index < inputString.length) && (!errorOccured)) {


                currentSymbols = inputString.charAt(index) + inputString.charAt(index + 1);
                index += 2;

                console.log("Hex: " + currentSymbols);

                if(Utils.isHex(currentSymbols)) {

                    characterValue = parseInt(currentSymbols, 16);
                    correctCharacter = String.fromCharCode(characterValue);

                    outputString += correctCharacter;
                }

                else {

                    console.log("Hex was not valid. Break");
                    errorOccured = true;
                }

            }

            console.log("Returning string: " + outputString);

            return outputString;

        } // hexToString()

    }
}
