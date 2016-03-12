Common.API.Widget = function () {
    this.putInnerHTML = function (b, c) {
        if (b != null) {
            while (b.firstChild) {
                if (b.deleteChild) {
                    b.deleteChild(b.firstChild)
                } else {
                    b.removeChild(b.firstChild)
                }
            }
            b.innerHTML = c
        }
    };

    this.sendReadyEvent = function () {
        log('Common.API.Widget::sendReadyEvent');
    };
};
