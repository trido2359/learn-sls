'use strict';

const jwk = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const request = require('request');

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
// refer to:        http://amzn.to/2fo77UI
const REGION = 'ap-southeast-1';
const POOL_ID = 'ap-southeast-1_3Q5zjxAua';
const iss = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`;

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
    try {
        console.log('Auth function invoked');
        // Remove 'bearer ' from token:
        const token = event.authorizationToken.substring(7);
        // Make a request to the iss + .well-known/jwks.json URL:
        request(
            { url: `${iss}/.well-known/jwks.json`, json: true },
            (error, response, body) => {
                console.log('body');
                
                console.log(body);
                console.log(response);
                
                console.log('error');
                console.log(error);

                
                const keys = body;
                // Based on the JSON of `jwks` create a Pem:
                const k = keys.keys[0];
                const jwkArray = {
                    kty: k.kty,
                    n: k.n,
                    e: k.e,
                };
                const pem = jwkToPem(jwkArray);

                // Verify the token:
                jwk.verify(token, pem, { issuer: iss }, (err, decoded) => {
                    console.log(decoded);
                    console.log('error Token');
                    console.log(err);
                    
                    return {
                        statusCode: 200,
                        body: generatePolicy(decoded, 'Allow', event.methodArn)
                    }
                });
            });
    } catch (err) {
        console.log('Err handled authen');
        console.log(err);
        return {
            statusCode: 400,
            body: 'Unauthorized'
        }
    }
};