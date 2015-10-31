var accountModule = angular.module('account');
accountModule.service('AuthService', ['$q', '$http', '$cookies', 'AccountResource', 
    function($q, $http, $cookies, AccountResource)
{
    var self = this;
    var basePath = '/api';

    this.ecofyToken = null; // Same as the cookie('ecofy_token')
    this.session = null;

    var COOKIE_NAME = 'ecofy_token';

    var COOKIE_OPTIONS = {
        path: '/'
    };

    /**
     * @param {Object} credentials: {username, password}.
     */
    this.signin = function(credentials) {

        return $http.post(basePath + '/signin', credentials)
        .then(function(response) {
            if (response.data) {
                // @todo - set cookie
                self.ecofyToken = response.data.token;
                //$cookies.set('ecofy_token', this.ecofyToken);
                self.setSession(response.data.auth.accountObject);
                return self.getSession();
            } else {
                // Login failed (bad id or password)
                return null;
            } 
        })
        .catch(function(error) {
            // Error wrapped by $http containing config, data, status, statusMessage, etc.
            //if (error.data)
            throw error;
        });
    };

    this.signout = function() {
        return $http({
                    method: 'POST',
                    url: basePath + '/signout',
                    headers: { 'Authorization': self.getToken() }
                })
        .then(function(response) {
            self.setToken(null);
            self.setAccount(null);
        });
    };

    /**
     * isAuthenticated
     */
    this.isAuthenticated = function() {
        if (this.getToken() || this.getAccount())
            return true;
        return false;
    }

    /**
     * getToken
     */
    this.getToken = function() {
        if (!this.ecofyToken) {
            this.ecofyToken = $cookies.get(COOKIE_NAME);
        }
        return this.ecofyToken;
    }

    /**
     * Sets token
     */
    this.setToken = function(value) {
        this.ecofyToken = value;
        if (!value) {
            $cookies.remove(COOKIE_NAME, COOKIE_OPTIONS);
        } else {
            $http.defaults.headers.common.Authorization = this.ecofyToken;
            $cookies.put(COOKIE_NAME, value, COOKIE_OPTIONS);
        }
    }

    /**
     * getAccount
     */
    this.getAccount = function() {
        return this.session;
    }

    /**
     *
     */
    this.setAccount = function(account) {
        this.session = account;
    }

    /**
     * fetchMyAccount
     * Fetches the current user account from token
     */
    this.fetchMyAccount = function() {
        var self = this;
        return $q(function(resolve, reject) {
            if (self.getAccount()) {
                return resolve(self.getAccount());
            }
            if (self.getToken()) {
                $http({
                    method: 'GET',
                    url: basePath + '/myaccount',
                    headers: { 'Authorization': self.getToken() }
                })
                .then(function(response) {
                    self.setAccount(response.data); // account
                    resolve(self.getAccount());
                })
                .catch(function(error) {
                    reject (error);
                });
            } else {
                // no token
                reject(null);
            }
        });
    }

}]);
