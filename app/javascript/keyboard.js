Keyboard = function(id)
{
    this.e = document.getElementById(id);
    this.targetElement = null;
    this.activeLayout = 'ru';
    this.layouts = {
        ru: [
            [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 0, {label:'<<<', handler:'processKeyboardBackspace', size:110}
            ],
            [
                'й','ц','у','к','е','н','г','ш','щ','з','х','ъ'
            ],
            [
                {label:'', spacer:25}, 'ф','ы','в','а','п','р','о','л','д','ж','э'
            ],
            [
                {label:'', spacer:85}, 'я','ч','с','м','и','т','ь','б','ю'
            ],
            [
                {label:'', spacer:85},
                {label:'en', handler:'layoutHandler', size: 80},
                {label:'пробел', valueToAppend: ' ', size: 350},
                {label:'поиск', handler:'processKeyboardSearch', size: 80}
            ]
        ]
    };

    this.showFor = function(el)
    {
        var keyboard = document.createElement('ul');
        var layout = this.layouts[this.activeLayout];
        for (var row = 0; row < layout.length; row++) {
            for (var k = 0; k < layout[row].length; k++) {
                var key = document.createElement('li');
                var keyData = layout[row][k];
                key.classList.add('keyboard-item');
                if (typeof keyData === 'object') {

                    if (keyData['valueToAppend'] !== undefined) {
                        key.dataset.valueToAppend = keyData['valueToAppend'];
                    }

                    if (keyData['handler'] !== undefined) {
                        key.dataset.on__key_enter = keyData['handler'];
                    }

                    key.textContent = keyData['label'];
                    if (keyData['spacer'] !== undefined) {
                        key.classList.add('keyboard-item-spacer-' + keyData['spacer']);
                        key.classList.add('keyboard-item-spacer');
                        key.classList.remove('keyboard-item');
                    } else if (keyData['size'] !== undefined){
                        key.classList.add('keyboard-item-' + keyData['size']);
                    }
                } else {
                    key.textContent = keyData;
                    key.dataset.valueToAppend = keyData;
                }

                if (key.dataset.on__key_enter === undefined) {
                    key.dataset.on__key_enter = 'processKeyboard';
                }
                if (k === 0) {
                    key.classList.add('keyboard-first-item');
                }
                keyboard.appendChild(key);
            }
        }
        this.targetElement = el;
        el.parentNode.insertBefore(keyboard, el.nextSibling);
    };
};