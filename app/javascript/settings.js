Settings = Settings ||
    {
        filename: 'settings.json',
        fs: null,
        cache: null,
        init: function(){
            alert('Settings.init');
            if (Settings.fs === null) {
                alert('Settings.init create fs');
                Settings.fs = new FileSystem();
            }

            if (Settings.fs && Settings.fs.isValidCommonPath(curWidget.id) === 0){
                alert('Settings.init createCommonDir ' + curWidget.id);
                Settings.fs.createCommonDir(curWidget.id);
            }

            return this;
        },
        readCache: function() {
            if (Settings.fs === null) {
                Settings.init();
            }

            var fileObj = Settings.fs.openCommonFile(curWidget.id + '/' + Settings.filename, 'r');
            Settings.cache = {};
            if (fileObj) {
                alert('Settings.readCache readAll');
                var result = fileObj.readAll();
                Settings.cache = JSON.parse(result);
                Settings.fs.closeCommonFile(fileObj);
            }
        },
        writeCache: function() {
            if (Settings.fs === null) {
                Settings.init();
            }

            var fileObj = Settings.fs.openCommonFile(curWidget.id + '/' + Settings.filename, 'w+');
            if (fileObj) {
                alert('Settings.writeCache writeAll');
                var result = fileObj.writeAll(JSON.stringify(Settings.cache));
                Settings.fs.closeCommonFile(fileObj);
            }
        },
        getData: function(key) {
            Settings.readCache();
            if (Settings.cache[key] !== undefined) {
                return Settings.cache[key];
            }
            return null;
        },
        setData: function(key, value) {
            if (key === undefined) {
                return undefined;
            }

            Settings.readCache();
            Settings.cache[key] = value;
            Settings.writeCache();

            return value;
        },
        clearSettings: function() {
            // TODO implement this to handle errors maybe
        }
    };