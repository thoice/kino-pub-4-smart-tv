Keyboardable = {
    init: function() {
        document.body.addEventListener('kbdbl:needfocus', Keyboardable.findFocus, false);
        document.body.addEventListener('kbdbl:navigate', Keyboardable.navigate, false);
    },
    findFocus: function() {
        var focusedL = followClassCrumbs('kbdbl-focused');
        if (!focusedL) {
            throw Error('Cannot find element with "kbdbl-focused" class');
        }
        focusedL.focus();
    },
    navigate: function(e) {
        var l = document.activeElement;
        var x = 0;
        var y = 0;
        if (e.keyCode === TvKeyCode.KEY_LEFT) { // left
            x = -1;
        } else if (e.keyCode === TvKeyCode.KEY_RIGHT) { // right
            x = 1;
        } else if (e.keyCode === TvKeyCode.KEY_UP) { // up
            y = -1;
        } else if (e.keyCode === TvKeyCode.KEY_DOWN) { // down
            y = 1;
        }
        var focusableL = Keyboardable.findLToFocus(l, x, y);

        if (!focusableL) {
            log('Keyboardable.navigate cannot find element to focus');
            return;
        }
        var event = new Event('main:find_and_focus');
        event.l = focusableL;
        document.body.dispatchEvent(event);
    },
    findLToFocus: function(srcL, x, y) {
        var lToFocus = null;
        if (x != 0) {
            lToFocus = findLHorizontally(srcL, x);
        } else if (y != 0) {
            lToFocus = findLVertically(srcL, y, true);
        }
        return lToFocus;
    }
};

document.addEventListener('DOMContentLoaded', Keyboardable.init, false);