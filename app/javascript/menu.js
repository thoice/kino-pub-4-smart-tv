Menu = function(id)
{
    this.id = id;
    this.e = document.getElementById(id);

    this.keyboard = new Keyboard(id);
    var input = document.getElementById('search_input')
    this.keyboard.showFor(input);

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
