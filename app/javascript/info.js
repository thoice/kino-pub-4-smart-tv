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
        Main.widget.putInnerHTML(this.descriptionElement, '');
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
        var dl = document.createElement('dl');
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
            var dt = this.createDt(itemsToRender[i]);
            dl.appendChild(dt);
            var dd = this.createDd(item[i]);
            dl.appendChild(dd);
        }
        this.descriptionElement.appendChild(dl);
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

    this.createDt = function(text)
    {
        var dt = document.createElement('dt');
        dt.classList.add('info-header');
        dt.textContent = text + ': ';
        return dt;
    };

    this.createDd = function(text)
    {
        if (text instanceof Array) {
            var jointText = [];
            for (var t = 0; t < text.length; t++) {
                jointText.push(text[t]['title']);
            }
            text = jointText.join(', ');
        }
        var dd = document.createElement('dd');
        dd.classList.add('info-text');
        widgetAPI.putInnerHTML(dd, text);
        return dd;
    };

    this.createVideoRows = function(item)
    {
        var videoLinks = [];

        switch(item.type) {
            case 'movie':
                // item[videos][0][duration]
                // item[videos][0][files][0][quality] = "480p"
                // item[videos][0][files][0][url][http] = "http://..."
                // item[videos][0][files][1][quality] = "720p"
                // item[videos][0][files][1][url][http] = "http://..."
                var video;
                for (var v = 0; v < item['videos'].length; v++) {
                    video = item['videos'][v];
                    var row = document.createElement('div');
                    row.classList.add('video-row');
                    var duration = document.createElement('span');
                    duration.classList.add('info-video-duration');
                    duration.textContent = Utils.secondsToDuration(video['duration']);
                    row.appendChild(duration);
                    var file;
                    for (var f = 0; f < video['files'].length; f++) {
                        file = video['files'][f];
                        var button = document.createElement('button');
                        button.classList.add('button');
                        button.dataset.on__key_enter = 'playVideo';
                        var btnText = document.createElement('span');
                        btnText.textContent = file['quality'];
                        button.appendChild(btnText);
                        button.dataset.url = file['url']['http'];
                        button.dataset.duration = video['duration'];
                        row.appendChild(button);
                    }
                    videoLinks.push(row);
                }
                break;
            default:
                // item[seasons][0][episodes][0][duration]
                // item[seasons][0][episodes][0][files][0][quality] = "480p"
                // item[seasons][0][episodes][0][files][0][url][http] = "http://..."
                //button = document.createElement('span');
                //button.textContent = 'Не поддерживаем пока';
                break;
        }
        return videoLinks;
    };

    this.playVideo = function(videoElement) {
        var url = videoElement.dataset.url;
        var duration = videoElement.dataset.duration;
        Main.pushToFocusStack(this, videoElement);
        Main.getScene('player_scene').showAndPlay(url, duration);
    }
};