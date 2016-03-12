OAuthDF = {};

// todo keep count of auth:init:call. Limit to 100 ?
/*
* Flow:
* If session HAS accessToken and it IS NOT expired, then return it
* If session HAS accessToken and it IS expired and if session has refresh_token, then ajax to refresh it
* If session DOES NOT HAVE accessToken and HAS device_code_response with user_code and code then ajax to get accessToken
* If session DOES NOT HAVE accessToken and DOES NOT HAVE device_code_response then ajax to get device_code_response
*/

OAuthDF.doAuth = function () {
    log('OAuthDF.doAuth');
    var s = Settings.getData('session') || {};

    var atr = s['access_token_response'] || {access_token: null};
    var dcr = s['device_code_response'];
    var accessToken = atr['access_token'];
    if (accessToken && !Settings.expired(atr['_requestTimestamp'], atr['expires_in'])) {
        delete(s['device_code_response']);
        log('OAuthDF auth:access_token:success');
        document.body.dispatchEvent(new Event('auth:access_token:success'));
        return accessToken;
    } else if (accessToken && Settings.expired(atr['_requestTimestamp'], atr['expires_in'])) {
        // refresh accessToken
        delete(s['device_code_response']);
        log('OAuthDF auth:refresh_token');

        var refresh_token = atr.refresh_token || '';
        Settings.setData('session', s);
        if (refresh_token) {
            log('OAuthDF send ajax:refresh_token');
            return Main.ajax(
                Main.apier.getMethodFor('refresh_token'),
                Main.apier.getUrlFor('refresh_token'),
                Main.apier.getParametersFor('refresh_token', {refresh_token: refresh_token}),
                'refresh_token'
            );
        } else {
            log('OAuthDF missing refresh_token', 'error');
            //todo delete session and restart auth
        }
    } else if (dcr) {
        // try to get accessToken
        delete(s['access_token_response']);
        log('OAuthDF has device_code. Trying to validate it');

        var userCode = dcr.user_code || '';
        var code = dcr.code || '';
        Settings.setData('session', s);
        if (userCode && code && confirm("Добавь этот код " + userCode)) {
            // todo show modal
            log('OAuthDF send ajax:access_token');
            return Main.ajax(
                Main.apier.getMethodFor('access_token'),
                Main.apier.getUrlFor('access_token'),
                Main.apier.getParametersFor('access_token', {code: code}),
                'access_token'
            );
        }
    } else {
        // query for device_code
        delete(s['access_token_response']);
        log('OAuthDF does not have device_code. Trying to get it');
        log('OAuthDF send ajax:device_code');
        Settings.setData('session', s);
        return Main.ajax(
            Main.apier.getMethodFor('device_code'),
            Main.apier.getUrlFor('device_code'),
            Main.apier.getParametersFor('device_code'),
            'device_code'
        );
    }
};

OAuthDF.deviceCodeSuccess = function (e) {
    log('OAuthDF ajax:device_code:success');
    var s = Settings.getData('session');
    s['device_code_response'] = e.parsedResponse;
    Settings.setData('session', s);
    document.body.dispatchEvent(new Event('auth:init:call'));
};

OAuthDF.accessTokenSuccess = function (e) {
    /* todo response = {scope: null, token_type: "bearer" } */
    log('OAuthDF ajax:access_token:success');
    var s = Settings.getData('session');
    s['access_token_response'] = e.parsedResponse;
    Settings.setData('session', s);
    document.body.dispatchEvent(new Event('auth:init:call'));
};

OAuthDF.refreshTokenSuccess = function (e) {
    /* todo response = {scope: null, token_type: "Bearer" } */
    log('OAuthDF ajax:refresh_token:success');
    var s = Settings.getData('session');
    s['access_token_response'] = e.parsedResponse;
    Settings.setData('session', s);
    document.body.dispatchEvent(new Event('auth:init:call'));
};

OAuthDF.error = function (e) {
    // todo "code_expired" "The authorization code has expired"
    var errorResponse = e.parsedResponse || { error: 'error' };
    var errorCode = errorResponse.error || 'error';
    var s = Settings.getData('session');
    switch (errorCode) {
        case 'authorization_pending':
            delete(s['access_token_response']);
            var dcr = s['device_code_response'];
            var userCode = dcr.user_code || '';
            var code = dcr.code || '';
            if (userCode && confirm("И все же, добавь этот код " + userCode)) {
                // todo show modal
                // todo extract to separate method to request access_token
                log('OAuthDF send ajax:access_token');
                return Main.ajax(
                    Main.apier.getMethodFor('access_token'),
                    Main.apier.getUrlFor('access_token'),
                    Main.apier.getParametersFor('access_token', {code: code}),
                    'access_token'
                );
            }

            break;
        case 'error':
        default:
            delete(s['device_code_response']);
            delete(s['access_token_response']);
            break;
    }

    Settings.setData('session', s);
    log('error:[' + e.parsedResponse.error + '] description:[' + e.parsedResponse.error_description + ']', 'error');
};

document.body.addEventListener('auth:init:call', OAuthDF.doAuth, false);

document.body.addEventListener('ajax:device_code:success', OAuthDF.deviceCodeSuccess, false);

document.body.addEventListener('ajax:access_token:success', OAuthDF.accessTokenSuccess, false);
document.body.addEventListener('ajax:access_token:error', OAuthDF.error, false);

document.body.addEventListener('ajax:refresh_token:success', OAuthDF.refreshTokenSuccess, false);
document.body.addEventListener('ajax:refresh_token:error', OAuthDF.error, false);


