var debug = false;

log = function (message, file, line) {
    //TODO append to top
    var s = document.createElement('span');
    s.classList.add('debug-item');
    var t = new Date();
    message = '[' + t.toLocaleTimeString() + '] ' + message;
    s.textContent = message;
    var w = document.getElementById('debug_wrapper');
    w.appendChild(s);
    w.scrollTop = w.scrollHeight
};

onerror = function (message, file, line) {
    log(message, file, line);
};


window.curWidget = window.curWidget || {
        id: 'sstv-kino.pub',
        height: 720
    };

Settings = {
    debug: false,
    cache: null,
    getData: function (key) {
        var jsonResult = localStorage.getItem(curWidget.id + '/settings.json');
        Settings.cache = JSON.parse(jsonResult);
        if (!Settings.cache || Settings.cache[key] === undefined) {
            Settings.cache = {};
            Settings.cache[key] = {};
        }
        return Settings.cache[key];
    }, setData: function (key, value) {
        var json = {};
        json[key] = value;
        json = JSON.stringify(json);
        localStorage.setItem(curWidget.id + '/settings.json', json);
        return value;
    }
};
if (!window.Common || !window.Common.API) {
    Common = {};
    Common.API = {};
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
            log('sendReadyEvent')
        }
    };

    Common.API.TVKeyValue = function () {
        return {
            KEY_RETURN: 37,
            KEY_PANEL_RETURN: 37
        };
        /*
         case tvKey.KEY_PANEL_RETURN:

         case tvKey.KEY_LEFT:

         case tvKey.KEY_RIGHT:

         case tvKey.KEY_UP:

         case tvKey.KEY_DOWN:

         case tvKey.KEY_ENTER:
         case tvKey.KEY_PANEL_ENTER:*/
    };
}