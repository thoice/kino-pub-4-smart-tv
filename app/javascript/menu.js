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
        this.keyboard.targetElement.value += element.dataset.valueToAppend;
    };

    this.processKeyboardSearch = function(element, event)
    {
        var grid = Main.getScene('grid_scene');
        grid.parameters['page'] = 1;
        grid.parameters['title'] = this.keyboard.targetElement.value;
        grid.showAndLoadPage();
    };

    this.processKeyboardBackspace = function(element, event)
    {
        var value = this.keyboard.targetElement.value;
        this.keyboard.targetElement.value = value.slice(0, value.length - 1);
    };

    this.applyFilters = function(element, event)
    {
        var types = document.querySelectorAll('#menu_types_wrapper .menu-radio');
        var type = null;
        var typeItem;
        for (var t = 0; t < types.length; t++) {
            typeItem = types[t];
            if (typeItem.checked === true || typeItem.checked === 'checked') {
                type = typeItem.value;
                break;
            }
        }

        var genres = document.querySelectorAll('#menu_genres_wrapper .menu-checkbox');
        var genre;
        var genresArray = [];
        for (var g = 0; g < genres.length; g++) {
            genre = genres[g];
            if (genre.parentNode.classList.contains('disabled')) { continue; }
            if (genre.checked !== true) { continue; }
            genresArray.push(genre.value);
        }

        var grid = Main.getScene('grid_scene');
        grid.setParameter('type', type);
        grid.setParameter('genre', genresArray);
        grid.setParameter('page', 1);
        Main.showSpinner('Применяем фильтры, ща все будет');
        grid.showAndLoadPage();
    };

    /**
     * Filter out genres based on picked type
     *
     * @param element
     * @param event
     */
    this.filterGenres = function(element, event)
    {
        var typeRadio = element.querySelector('.menu-radio');
        if (typeRadio === undefined || !typeRadio.value) {
            return;
        }
        typeRadio.checked = 'checked';
        var classToLeaveActive = '';
        switch (typeRadio.value) {
            case 'concert':
                classToLeaveActive = 'music';
                break;
            case 'movie':
            case 'serial':
            case '3d':
                classToLeaveActive = 'movie';
                break;
            case 'documovie':
            case 'docuserial':
                classToLeaveActive = 'docu';
                break;
            case 'all':
                classToLeaveActive = '';
                break;
            default:
                break;
        }

        var genresWrapper = document.getElementById('menu_genres_wrapper');
        var checkboxLabels = genresWrapper.querySelectorAll('.menu-checkbox-label');
        for (var cl = 0; cl < checkboxLabels.length; cl++) {
            var checkboxLabel = checkboxLabels[cl];
            if (classToLeaveActive === '' || checkboxLabel.classList.contains('menu-type-' + classToLeaveActive)) {
                checkboxLabel.classList.remove('disabled');
            } else {
                checkboxLabel.classList.add('disabled');
            }
        }
        return true;
    }
};

Menu.prototype.getMenuItems = function()
{
    Main.apier.ajax(Main.apier.getTypesUrl(), {}, 'get', this.loadTypesHandler);
    Main.apier.ajax(Main.apier.getGenresUrl(), {}, 'get', this.loadGenresHandler);
};

Menu.prototype.loadTypesHandler = function(response)
{
    var item;
    var wrapper = document.getElementById('menu_types_wrapper');
    response.items.unshift({id: 'all',title: 'Все', default: true});
    for (var i in response.items) {
        if (!response.items.hasOwnProperty(i)) { continue; }
        item = response.items[i];
        var label = document.createElement('label');
        label.classList.add('menu-radio-label');
        label.dataset.on__key_enter = 'filterGenres';
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.value = item['id'];
        radio.name = 'type';
        radio.classList.add('menu-radio');
        if (item['default'] === true) {
            radio.checked = 'checked';
        }
        label.appendChild(radio);
        var labelText = document.createElement('span');
        labelText.textContent = item['title'];
        label.appendChild(labelText);
        wrapper.appendChild(label);
    }
};

Menu.prototype.loadGenresHandler = function(response)
{
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

    var filtersApplyButton = document.createElement('button');
    filtersApplyButton.textContent = 'Применить фильтры';
    filtersApplyButton.classList.add('button');
    filtersApplyButton.classList.add('button-apply-filters');
    filtersApplyButton.dataset.on__key_enter = 'applyFilters';

    wrapper.appendChild(filtersApplyButton);

    var filtersResetButton = document.createElement('button');
    filtersResetButton.textContent = 'Сбросить фильтры';
    filtersResetButton.classList.add('button');
    filtersResetButton.classList.add('button-reset-filters');
    filtersResetButton.dataset.on__key_enter = 'resetFilters';

    wrapper.appendChild(filtersResetButton);
};
