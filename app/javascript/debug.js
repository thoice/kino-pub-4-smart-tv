var debug = false;//false;
var consoledebug = false;//true;

log = function (message, file, line) {
    if (consoledebug === true) {
        console.log(message);
    } else {
        var s = document.createElement('span');
        s.classList.add('debug-item');
        var t = new Date();
        message = '[' + t.toLocaleTimeString() + '] ' + message;
        s.textContent = message;
        var w = document.getElementById('debug_wrapper');
        w.appendChild(s);
        w.scrollTop = w.scrollHeight
    }
};

onerror = function (message, file, line) {
    log(message, file, line);
};


window.curWidget = window.curWidget || {
        //id: 'sstv-kino.pub',
        id: 'kino-pub-4-smart-tv',
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
}
if (curWidget !== undefined && curWidget.path === undefined)
{
    Common.API.TVKeyValue = function () {
        /*
         KEY_ENTER       == enter    == 13
         KEY_RETURN      == \        ==
         KEY_LEFT       ==  left     == 37
         KEY_RIGHT      ==  right    == 39

         KEY_REW         == q        ==
         KEY_PLAY        == w        ==
         KEY_PAUSE       == e        ==
         KEY_FF          == r        ==

         KEY_RED_A       == l        ==  108
         KEY_GREEN_B     == b        ==
         KEY_YELLOW_C    == c        ==
         KEY_BLUE_D      == d        ==
         KEY_POWER       == `
         */
        return {
            KEY_LEFT: 37,  // 4
            KEY_RIGHT: 39, // 5
            KEY_ENTER: 13, // 29443
            KEY_RETURN: 88,
            KEY_PLAY: 71,
            KEY_PAUSE: 74,
            KEY_TOOLS: 75
        };
    };

}