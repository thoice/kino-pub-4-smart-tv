Menu = function(id)
{
    this.id = id;
    this.e = document.getElementById(id);

    this.keyboard = new Keyboard(id);
    var input = document.getElementById('search_input')
    this.keyboard.showFor(input);
    this.getMenuItems();

    this.activateTab = function(element)
    {
        var oldTab= element.parentNode.querySelector('.menu-tab-header.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }
        element.classList.add('active');
    };

    this.processKeyboard = function(element, event)
    {
        var valueToAppend = element.dataset.valueToAppend;
        this.keyboard.targetElement.value += valueToAppend;
    };

    this.processKeyboardSearch = function(element, event)
    {
        var grid = Main.getScene('grid_scene');
        grid.parameters['page'] = 1;
        var valueToSearch = this.keyboard.targetElement.value;
        grid.parameters['title'] = valueToSearch;
        grid.showAndLoadPage();
    };

    this.processKeyboardBackspace = function(element, event)
    {
        var value = this.keyboard.targetElement.value;
        this.keyboard.targetElement.value = value.slice(0, value.length - 1);
    };
};

Menu.prototype.getMenuItems = function()
{
    Main.apier.ajax(Main.apier.getTypesUrl(), {}, 'get', this.loadTypesHandler);
    Main.apier.ajax(Main.apier.getGenresUrl(), {}, 'get', this.loadGenresHandler);
};

Menu.prototype.loadTypesHandler = function(response)
{
    // TODO Add All filter
    // TODO Add handler for picking specific filter
    // TODO Update properties
    var item;
    var wrapper = document.getElementById('menu_types_wrapper');
    for (var i in response.items) {
        if (!response.items.hasOwnProperty(i)) { continue; }
        item = response.items[i];
        var label = document.createElement('label');
        label.classList.add('menu-radio-label');
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.value = item['id'];
        radio.name = 'type';
        radio.classList.add('menu-radio');
        label.appendChild(radio);
        var labelText = document.createElement('span');
        labelText.textContent = item['title'];
        label.appendChild(labelText);
        wrapper.appendChild(label);
    }
};

Menu.prototype.loadGenresHandler = function(response)
{
    // TODO Update properties
    var item;
    var wrapper = document.getElementById('menu_genres_wrapper');

    for (var i in response.items) {
        if (!response.items.hasOwnProperty(i)) { continue; }
        item = response.items[i];

        var label = document.createElement('label');
        label.classList.add('menu-checkbox-label');
        label.classList.add('menu-type-' + item['type']);
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item['id'];
        checkbox.classList.add('menu-checkbox');
        label.appendChild(checkbox);
        var labelText = document.createElement('span');
        labelText.textContent = item['title'];
        label.appendChild(labelText);
        wrapper.appendChild(label);
    }

    // TODO filter genres by selected type.
    // TODO add notification that genre has limitation
    console.dir(response);
};
