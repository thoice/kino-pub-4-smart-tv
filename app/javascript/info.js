Info = function(id) {
    this.id = id;
    this.e = document.getElementById(id);
    this.descriptionElement = document.querySelector('#' + id + ' #info_description');
    this.videosElement = document.querySelector('#' + id + ' #info_videos')
    this.parameters = {};

    //TODO if clicked top left corner and loadAndShowItemInfo does errors out(Cannot read property 'contains' of undefined) the keyDown works. Why????
    this.showAndLoad = function (element) {
        log('Info.showAndLoad');
        Main.showScene('info_scene');
        Main.showSpinner('Роботы работают еще усерднее и сейчас мы узнаем подробности');

        var itemId = element.dataset.id;
        Main.apier.ajax(Main.apier.getItemUrl(itemId), this.parameters, 'get', this.loadHandler);
    };

    this.loadHandler = function(response) {
        //var item = Main.apier.convertResponseToItemInfo(response);
        var info = Main.getScene('info_scene');
        info.renderItem(response.item);
        Main.hideSpinner();
        log('Grid.loadHandler complete');
    };

    this.renderItem = function(item) {
        widgetAPI.putInnerHTML(this.descriptionElement, '');
        widgetAPI.putInnerHTML(this.videosElement, '')
        // TODO fix when images will be fixed
        //var poster = document.createElement('img');
        // TODO placeholder
        //poster.src = item['poster'] || '';
        //poster.classList.add('info-poster');
        //this.e.appendChild(poster);

        var videoLinks = this.createVideoRows(item);
        for (var v = 0; v < videoLinks.length; v++) {
            var videoLinksRow = videoLinks[v];
            this.videosElement.appendChild(videoLinksRow);
        }

        //id
        //type
        //subtype
        var details_wrapper = document.createElement('div');
        var itemsToRender = {
            year: 'Год',
            genres: 'Жанры',
            plot: 'Описание',
            director: 'Режисер',
            countries: 'Страны',
            cast: 'В ролях',
            imdb_rating: 'IMDB',
            rating: 'Рейтинг'
        };

        var title = document.createElement('p');
        title.classList.add('info-title');
        title.classList.add('info-text');
        title.textContent = item.title;
        this.descriptionElement.appendChild(title);

        for (i in itemsToRender) {
            if (!itemsToRender.hasOwnProperty(i)) { continue; }
            if (!item.hasOwnProperty(i)) { continue; }
            var infoRow = this.createInfoRow(itemsToRender[i], item[i]);
            details_wrapper.appendChild(infoRow);
        }
        this.descriptionElement.appendChild(details_wrapper);
        // TODO IMDB link item.imdb
        // TODO item.imdb_votes
        // TODO kinopoisk link item.kinopoisk
        //kinopoisk_rating
        //kinopoisk_votes
        //rating
        //rating_votes
        //rating_percentage
        //views
        //comments
        //posters
        //videos
    };

    this.createInfoRow = function(labelText, text)
    {
        var label = document.createElement('label');
        label.classList.add('info-header');
        label.textContent = labelText + ': ';
        if (text instanceof Array) {
            var jointText = [];
            for (var t = 0; t < text.length; t++) {
                jointText.push(text[t]['title']);
            }
            text = jointText.join(', ');
        }
        var textSpan = document.createElement('span');
        textSpan.classList.add('info-text');
        widgetAPI.putInnerHTML(textSpan, text);
        label.appendChild(textSpan);
        return label;
    };

    this.createVideoRows = function(item)
    {
        var videoLinks = [];
        var isOdd = false;
        var rowData;
        var title;
        switch(item.type) {
            case 'movie':
            case 'documovie':
            case '3D':
            case 'concert':
                // item[videos][0][duration]
                // item[videos][0][files][0][quality] = "480p"
                // item[videos][0][files][0][url][http] = "http://..."
                // item[videos][0][files][1][quality] = "720p"
                // item[videos][0][files][1][url][http] = "http://..."
                for (var v = 0; v < item['videos'].length; v++) {
                    rowData = item['videos'][v];
                    var row = this.createVideoRow(rowData);
                    videoLinks.push(row);
                }
                break;
            case 'serial':
            case 'docuserial':
                // item[seasons][0][episodes][0][duration]
                // item[seasons][0][episodes][0][files][0][quality] = "480p"
                // item[seasons][0][episodes][0][files][0][url][http] = "http://..."
                for (var s = 0; s < item.seasons.length; s++) {
                    var season = item.seasons[s];
                    for (var e = 0; e < season.episodes.length; e++) {
                        rowData = season.episodes[e];
                        title = 's' + season.number + 'e' + rowData.number;
                        isOdd ^= true;
                        var row = this.createVideoRow(rowData, title, isOdd);
                        videoLinks.push(row);
                    }
                }

                break;
            default:
                break;
        }
        return videoLinks;
    };

    this.createVideoRow = function(rowData, rowTitle, isOdd)
    {
        var row = document.createElement('div');
        row.classList.add('video-row');
        if (isOdd) {
            row.classList.add('odd');
        }
        var file;
        for (var f = 0; f < rowData['files'].length; f++) {
            file = rowData['files'][f];
            var button = document.createElement('button');
            button.classList.add('button');
            button.dataset.on__key_enter = 'playVideo';
            var btnText = document.createElement('span');
            btnText.textContent = file['quality'];
            button.appendChild(btnText);
            button.dataset.url = file['url']['http'];
            button.dataset.duration = rowData['duration'];
            row.appendChild(button);
        }
        if (rowTitle) {
            var title = document.createElement('span');
            title.textContent = rowTitle;
            title.classList.add('row-title');
            row.appendChild(title);
        }

        var duration = document.createElement('span');
        duration.classList.add('info-video-duration');
        duration.textContent = Utils.secondsToDuration(rowData['duration']);
        row.appendChild(duration);
        return row;
    };

    this.playVideo = function(videoElement)
    {
        var url = videoElement.dataset.url;
        var duration = videoElement.dataset.duration;
        Main.pushToFocusStack(this, videoElement);
        Main.getScene('player_scene').showAndPlay(url, duration);
    };

    this.activateTab = function(element)
    {
        var oldTab= element.parentNode.querySelector('.info-tab-header.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }
        element.classList.add('active');
    };
};