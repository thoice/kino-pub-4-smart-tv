/*
todo maybe replace focus children traversal with document.body.querySelector('.kbdbl-focused .kbdbl-focused .kbdbl-focused .kbdbl-focused .kbdbl-focused .kbdbl-focused')
*/
Keyboardable = {
    init: function() {
        document.body.addEventListener('grid:pager:focus', Keyboardable.gridPagerFocus, false);
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
        l = Keyboardable.findLToFocus(l, x, y);

        if (!l) {
            log('Keyboardable.navigate cannot find element to focus');
            return;
        }
        if(l.dataset['onFocusEvent']) {
            var event = new Event(l.dataset['onFocusEvent']);
            event.l = l;
            document.body.dispatchEvent(event);
        } else if (l) {
            l.focus();
        }
    },
    findLToFocus: function(srcL, x, y) {
        var lToFocus = null;
        if (x != 0) {
            lToFocus = findLHorizontally(srcL, x);
        } else if (y != 0) {
            lToFocus = findLVertically(srcL, y, true);
        }
        return lToFocus;
    },
    gridPagerFocus: function(e) {
        alert('grid:pager:focus in Keyboardable.gridPagerFocus');
    }
};

document.addEventListener('DOMContentLoaded', Keyboardable.init, false);