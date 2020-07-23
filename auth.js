'use strict';

const jwk = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
// refer to:        http://amzn.to/2fo77UI
const REGION = 'ap-southeast-1';
const POOL_ID = 'ap-southeast-1_3Q5zjxAua';
const ISS = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`;

// Generate policy to allow this user on this API:
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.authorize = (event, context, cb) => {
    if (event.authorizationToken) {
        // Remove 'bearer ' from token:
        const token = event.authorizationToken;
        // Make a request to the iss + .well-known/jwks.json URL:
        axios({ url: `${ISS}/.well-known/jwks.json`, json: true }).then(
            response => {
                if (response.status !== 200) {
                    console.log('response', response);
                    cb('Unauthorized');
                }
                const keys = response.data;
                // Based on the JSON of `jwks` create a Pem:
                const k = keys.keys[0];
                const jwkArray = {
                    kty: k.kty,
                    n: k.n,
                    e: k.e
                };
                const pem = jwkToPem(jwkArray);
                console.log('RUNNING1111');
                console.log(token);
                
                // cb(
                //     null,
                //     'Test Pass authorize'
                //   );

                // Verify the token:
                jwk.verify(token, pem, { issuer: ISS }, (err, decoded) => {
                    if (err) {
                        console.log('err parse token', err);
                        cb('Unauthorized');
                        // return {
                        //     statusCode: 400,
                        //     body: 'Unauthorized'
                        // }
                    } else {
                        cb(null, generatePolicy(decoded.sub, 'Allow', []));
                        // return {
                        //     statusCode: 200,
                        //     body: generatePolicy(decoded.sub, 'Allow', [])
                        // }
                    }
                });
            }
        );
    } else {
        console.log('No authorizationToken found in the header.');
        cb('Unauthorized');
    }
};