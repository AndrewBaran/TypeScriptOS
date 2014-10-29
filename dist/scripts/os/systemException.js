var TSOS;
(function (TSOS) {
    var SystemException = (function () {
        // Constructors
        function SystemException(message) {
            this.name = "SystemException";
            this.message = message;
        }
        return SystemException;
    })();
    TSOS.SystemException = SystemException;
})(TSOS || (TSOS = {}));
