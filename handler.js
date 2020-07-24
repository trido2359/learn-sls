'use strict';

const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const request = require('request')

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
// refer to:        http://amzn.to/2fo77UI

const ISS = 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_bfYJXG8re';
const token = 'eyJraWQiOiJvZTRqQThsL2hGQW1YOE0yai9ySldhTTcwVDNPSm5VV1E1bnNTZUJ3OHJrPSIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiI1MTMzZjI4MC0zMmMxLTQ0NjgtYTk5Ny0xNjdhOTQ5YTk2YzQiLCJjb2duaXRvOmdyb3VwcyI6WyJhcC1zb3V0aGVhc3QtMV9iZllKWEc4cmVfRmFjZWJvb2siXSwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwiLCJhdXRoX3RpbWUiOjE1OTU1NjEwNzEsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbS9hcC1zb3V0aGVhc3QtMV9iZllKWEc4cmUiLCJleHAiOjE1OTU1NjQ2NzEsImlhdCI6MTU5NTU2MTA3MSwidmVyc2lvbiI6MiwianRpIjoiYWMyOTkzYTYtYTQ0NS00NTZmLWFjMzItY2Y3MjIzNjRjNTQ1IiwiY2xpZW50X2lkIjoiNHJ0bHFkaXNrbnU2bWFqNWJxaTM1NmdkZGkiLCJ1c2VybmFtZSI6ImZhY2Vib29rXzI3MzAyNzY5NjA1ODkxMDcifQ.zu9LP5cWrAJzRBHFBB03CBopkpM4yfbRrHAaUUj1yFI';



module.exports.test = async event => {
    return {
        statusCode: 200,
        body: 'Test'
    };

};

module.exports.hello =  (event, context, callback) => {
    const body = {
        message: 'Successs - Profile Retrieved!',
        input: event,
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(body),
    };

    return response;

};

module.exports.auth = (event, context, callback) => {

    console.log('Auth');
    

    var token = event.authorizationToken;
    /*
     *
     * extra custom authorization logic here: OAUTH, JWT ... etc
     *
     */

    // In this example, the token is treated as the status for simplicity.
    switch (token) {
        case 'allow':
            callback(null, generatePolicy('user', 'Allow', event.methodArn));
            break;
        case 'deny':
            callback(null, generatePolicy('user', 'Deny', event.methodArn));
            break;
        case 'unauthorized':
            callback('Unauthorized');
            break;
        default:
            callback('Error');
    }
};


module.exports.validateToken = (event, context, callback) => {
    request({
        url: `${ISS}/.well-known/jwks.json`,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let pems = {};
            const keys = body['keys'];
            for (let i = 0; i < keys.length; i++) {
                const key_id = keys[i].kid;
                const modulus = keys[i].n;
                const exponent = keys[i].e;
                const key_type = keys[i].kty;
                const jwk = { kty: key_type, n: modulus, e: exponent };
                const pem = jwkToPem(jwk);
                pems[key_id] = pem;
            }
            const decodedJwt = jwt.decode(token, { complete: true });
            if (!decodedJwt) {
                console.log("Not a valid JWT token");
                callback(new Error('Not a valid JWT token'));
            }
            const k = keys[0];
            const jwkArray = {
                kty: k.kty,
                n: k.n,
                e: k.e
            };
            const pem = jwkToPem(jwkArray);
            console.log('----');
            console.log(decodedJwt);


            if (!pem) {
                console.log('Invalid token --');
                callback(new Error('Invalid token'));
            }
            jwt.verify(token, pem, function (err, payload) {
                if (err) {
                    console.log("Invalid Token.");
                    callback(new Error('Invalid token'));
                } else {
                    console.log("Valid Token.");
                    callback(null, "Valid token");
                }
            });
        } else {
            console.log("Error! Unable to download JWKs");
            callback(error);
        }
    });
}