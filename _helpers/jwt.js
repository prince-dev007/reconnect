const expressJwt = require('express-jwt');
require("dotenv").config();

var JWT_SECRET = process.env.JWT_SECRET;
const config = {
    "secret": `${JWT_SECRET}`
}

module.exports = jwt;

function jwt() {
    const { secret } = config;
    return expressJwt({ secret }).unless({
        path: [
            // public routes that don't require authentication
            '/agents/requestOTP',
            '/agents/requestOTP/',
            '/agents/login',
            '/agents/login/'
        ]
    });
}