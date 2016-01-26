Utils = {
    /**
     * Get parent element that has corresponding data attribute
     *
     * @param e
     * @param dataName
     * @returns {*}
     */
    findAscenderWithData: function (e, dataName) {
        if (e.dataset && e.dataset[dataName] !== undefined) {
            return e;
        }
        if (e.parentNode !== null) {
            return Utils.findAscenderWithData(e.parentNode, dataName);
        }
        return null;
    },
    /**
     * Find key by value
     *
     * @param obj
     * @param value
     * @returns {string}
     */
    findKeyByValue: function (obj, value) {
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) {
                continue;
            }
            if (obj[k] === value) {
                return k;
            }
        }
    },
    /**
     * Convert 5025 to '01:23:45'
     *
     * @param totalSeconds
     * @returns {string}
     */
    secondsToDuration: function (totalSeconds) {
        var hours = parseInt(totalSeconds / 3600) % 24;
        var minutes = parseInt(totalSeconds / 60) % 60;
        var seconds = totalSeconds % 60;
        var result = (hours < 10 ? "0" + hours : hours)
            + ":" + (minutes < 10 ? "0" + minutes : minutes)
            + ":" + (seconds < 10 ? "0" + seconds : seconds);

        return result;
    },
    /**
     * Convert '01:23:45' to 5025
     *
     * @param duration
     * @returns {number}
     */
    durationToSeconds: function (duration) {
        var a = duration.split(':');
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        return seconds;
    }
};