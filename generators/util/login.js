'use strict';
const axios = require('axios').default;

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};
const request = {
  grecaptcharesponse: 'Tk9UQVZBTElEQ0FQVENIQUZPUlRISVNSRVFVRVNU',
  username: '',
  password: '',
};

module.exports = class Login {
  static async login(username, password, loginUrl) {
    request.username = username;
    request.password = password;
    var response = await axios.post(loginUrl, request, config).then(
      response => {
        if (!response.data.token) {
          response.failure = true;
          response.error = 'Login Failure ';
          response.message = 'Username o password is wrong';
        }
        return response;
      },
      error => {
        error.failure = true;
        error.error = 'Login Failure ';
        error.message = error.errno + error.address;
        return error;
      }
    );
    return response;
  }
};
