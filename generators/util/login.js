"use strict";
const axios = require('axios').default;

const url = 'http://VSMIIC230/generador-api/auth/login';
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
const request = {
    'grecaptcharesponse': 'Tk9UQVZBTElEQ0FQVENIQUZPUlRISVNSRVFVRVNU',
    'username': '',
    'password': ''
}

module.exports = class Login {
    static async login(username, password) {
        request.username = username;
        request.password = password;
        var response = await axios.post(url, request, config).then(
            (response) => {
                if (!response.token) {
                    response.failure = true;
                    response.error = "Login Failure ";
                    response.message = "Username o password is wrong"
                }
                return response
            },
            (error) => {
                error.failure = true;
                error.error = "Login Failure ";
                error.message = error.errno + error.address;
                return error
            }
        );
        return response;
    }
};
