'use strict';
const axios = require('axios').default;

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

module.exports = class SalsaLogin {
  static async login(context) {
    const params = new URLSearchParams();
    params.append('username', context.request.username);
    params.append('password', context.request.password);
    params.append('grant_type', 'password');
    params.append('client_id', context.request.client_id);
    params.append('client_secret', context.request.client_secret);
    return axios.post(context.loginUrl, params, config).then(
      response => {
        if (!response.data.token) {
          response.failure = true;
          response.error = 'Login Failure ';
          response.message = 'Username o password is wrong';
        }
        return {
          headers: { Authorization: `Bearer ${response.data.access_token}` },
        };
      },
      error => {
        error.failure = true;
        error.error = 'Login Failure ';
        error.message = error.errno + error.address;
        return error;
      }
    );
  }
};
