var accountModule = angular.module('account', ['ngResource']);

/**
 * Service that provides Authentication facility  
 */
accountModule.service('AuthService', ['$q', '$http', '$cookies', 
    function($q, $http, $cookies)
{
    var self = this;
    var basePath = '/api';

    this.ecofyToken = null; // Same as the cookie('ecofy_token')
    this.account = null;

    var COOKIE_NAME = 'ecofy_token';

    var COOKIE_OPTIONS = {
        path: '/'
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
        return this.account;
    }

    /**
     *
     */
    this.setAccount = function(account) {
        this.account = account;
    }

    this.setSession = function(token, account) {
        this.setToken(token);
        this.setAccount(account);
    }

    /**
     * @param {Object} account: {username, password}.
     */
    this.signup = function(account) {

        return $http.post(basePath + '/signup', account)
        .then(function(response) {
            if (response.data) {
                self.setSession(response.data.token, response.data.auth.accountObject);
                return self.getAccount();
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

    /**
     * @param {Object} credentials: {username, password}.
     */
    this.signin = function(credentials) {

        return $http.post(basePath + '/signin', credentials)
        .then(function(response) {
            if (response.data) {
                self.setSession(response.data.token, response.data.auth.accountObject);
                return self.getAccount();
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
