var accountModule = angular.module('account');
accountModule.service('AuthService', ['$q', '$http', '$cookies', 'AccountResource', 
	function($q, $http, $cookies, AccountResource)
{

	var basePath = '/api';

	this.session = null;

	/**
	 * @param {Object} credentials: {username, password}.
	 */
	this.signin = function(credentials) {
		return $http.post(basePath + '/signin', credentials)
		.then(function(response) {
			if (response.data) {
				this.setSession(response.data.auth.accountObject);
				return this.getSession();
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
		this.setAccount(null);
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
			this.ecofyToken = $cookies.get('ecofy_token');
		}
		return this.ecofyToken;
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
