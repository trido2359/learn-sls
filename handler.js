'use strict';
global.fetch = require('node-fetch');
global.navigator = () => null;
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
    UserPoolId: "ap-southeast-1_AqI7W18Qk",
    ClientId: "32ba2gqtadf1nugo7c8hgelou1"
};
const pool_region = "ap-southeast-1";
const ISS = `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}`;
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


module.exports.register = async (event, conext, cb) => {
    try {
        console.log('Register');
        const { email, password } = event;

        const attributeList = [];

        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
        userPool.signUp(email, password, attributeList, null, function (err, result) {
            if (err) {
                console.log('err', err);
                return {
                    statusCode: 400,
                    body: 'Bad Request'
                };
            }

            return {
                statusCode: 200,
                body: 'Register successfully'
            };

        })
    } catch (err) {
        console.log('err register', err);

        return {
            statusCode: 500,
            body: 'Server Err'
        };
    }
};

module.exports.verifyAccount = async (event, conext, cb) => {
    try {
        console.log('verifyAccount');
        const { email, code } = event;
        const userData = {
            Username: email,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.confirmRegistration(code, true, function (err, result) {
            if (err) {
                console.log(err.message || JSON.stringify(err));
                return {
                    statusCode: 400,
                    body: err.message 
                };
            }
            console.log('call result: ' + result);
            return {
                statusCode: 200,
                body: 'done' 
            };
        });
    } catch (err) {
        console.log('err verify');
        return {
            statusCode: 500,
            body: err.message 
        };
    }
};


module.exports.login = async (event, conext, cb) => {
    try {
        const { email, password } = event;
        const authenticationData = {
            Username: email,
            Password: password,
        };
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
            authenticationData
        );

        const userData = {
            Username: email,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const accessToken = result.getAccessToken().getJwtToken();
                console.log('access token :' + accessToken);
                //console.log('id token :' + result.getIdToken().getJwtToken());
                // console.log('refresh token :' + result.getRefreshToken().getToken());

                return {
                    statusCode: 200,
                    body: accessToken
                };

            },

            onFailure: function (err) {
                console.log(err.message || JSON.stringify(err));
                return {
                    statusCode: 200,
                    body: err.message
                };
            },
        });
    } catch (err) {
        console.log('err login', err);
        return {
            statusCode: 500,
            body: err.message
        };
    }
};

module.exports.hello = async (event, context, cb) => {
    console.log('hello');
    console.log(event);
    return {
        statusCode: 200,
        body: 'Hello 123'
    };
};