const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const request = require('request');

const poolData = {
    UserPoolId: "ap-southeast-1_AqI7W18Qk",
    ClientId: "32ba2gqtadf1nugo7c8hgelou1"
};
const pool_region = "ap-southeast-1";
const ISS = `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}`;

async function getJWKs(jwksPath) {
    return new Promise((resolve, reject) => {
        request({ url: jwksPath, json: true }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return reject(new Error(
                    'Error while getting JWKs. ' + JSON.stringify(error, null, 2)));
            }
            resolve(body['keys']);
        });
    });
}

function getPems(jwks) {
    const pems = {};
    for (let i = 0; i < jwks.length; i++) {
        const keyId = jwks[i].kid;
        const modulus = jwks[i].n;
        const exponent = jwks[i].e;
        const keyType = jwks[i].kty;
        const jwk = { kty: keyType, n: modulus, e: exponent };
        const pem = jwkToPem(jwk);
        pems[keyId] = pem;
    }
    return pems;
}

async function validateAccessToken(jwtToken, pems, iss) {
    const decodedJwt = jwt.decode(jwtToken, { complete: true });
    // Fail if the token is not jwt
    if (!decodedJwt) {
        throw new Error('Not a valid JWT Token');
    }

    // Fail if token issure is invalid
    if (decodedJwt.payload.iss !== iss) {
        throw new Error('Invalid issuer: ' + decodedJwt.payload.iss);
    }

    // Reject the jwt if it's not an id token
    if (!(decodedJwt.payload.token_use === 'access')) {
        throw new Error('Invalid token_use: ' + decodedJwt.payload.token_use);
    }
    

    // // Fail if token audience is invalid
    // if (decodedJwt.payload.aud !== aud) {
    //     throw new Error('Invalid aud: ' + decodedJwt.payload.aud);
    // }

    // Get the kid from the token and retrieve corresponding PEM
    const kid = decodedJwt.header.kid;
    const pem = pems[kid];

    if (!pem) {
        throw new Error('Invalid kid: ' + decodedJwt.header.kid);
    }

    return new Promise((resolve, reject) => {
        jwt.verify(jwtToken, pem, { issuer: iss }, (err, payload) => {
            if (err) {
                switch (err.name) {
                    case 'TokenExpiredError':
                        reject(new Error('JWT Token Expired.'));
                        break;
                    case 'JsonWebTokenError':
                        reject(new Error('Invalid JWT Token.'));
                        break;
                    default:
                        reject(new Error(
                            'Token verification failure. ' + JSON.stringify(err, null, 2)));
                        break;
                }
            } else {
                resolve(payload);
            }
        });
    });
}

async function validate(token) {

    const jwksUrl = await getJWKs(`${ISS}/.well-known/jwks.json`);
    const pems = getPems(jwksUrl);
    
    tokenPayload = await validateAccessToken(token, pems, ISS);

    return tokenPayload;
}

module.exports.validateToken = validate;