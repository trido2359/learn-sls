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

function registerAccount(email, password) {
    const attributeList = [];

    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    return new Promise((resolve, reject) => {
        userPool.signUp(email, password, attributeList, null, function (err, result) {
            if (err) {
                resolve({
                    status: 0,
                    body: err.message
                })
            }
            resolve({
                status: 1,
                body: result
            });
        })
    })
}

module.exports.register = async (event, context, cb) => {
    try {
        console.log('Process Register11');
        const { body } = event;
        const { email, password } = JSON.parse(body);

        console.log(email + '-' + password);

        const result = await registerAccount(email, password);
        console.log(result);

        if(!result.status) {
            return {
                statusCode: 400,
                body: result.body
            }
        }

        return {
            statusCode: 200,
            body: result.body
        }
        

    } catch (err) {
        console.log('err register', err);

        return {
            statusCode: 500,
            body: 'register error'
        }
    }
};

function confirmRegistration(email, code) {
    const userData = {
        Username: email,
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, function (err, result) {
            if (err) {
                resolve({
                    status: 0,
                    body: err.message
                })
            }
            resolve({
                status: 1,
                body: result
            });
        });
    })
}


module.exports.verifyAccount = async (event, context, cb) => {
    try {
        console.log('verifyAccount');
        const { body } = event;
        const { email, code } = JSON.parse(body);

        const result = await confirmRegistration(email, code);
        console.log(result);

        if(!result.status) {
            return {
                statusCode: 400,
                body: result.body
            }
        }

        return {
            statusCode: 200,
            body: result.body
        }
      
    } catch (err) {
        console.log('err verify');
        return {
            statusCode: 500,
            body: err.message 
        };
    }
};

function loginAccount(email, password) {
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

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const accessToken = result.getAccessToken().getJwtToken();

                resolve({
                    status: 1,
                    body: accessToken
                })
    
            },
    
            onFailure: function (err) {
                console.log(err.message || JSON.stringify(err));
                resolve({
                    status: 0,
                    body: err.message
                })
            },
        });
    })

}

module.exports.login = async (event, context, cb) => {
    try {
        const { body } = event;
        const { email, password } = JSON.parse(body);
        const result = await loginAccount(email, password);
        console.log(result);

        if(!result.status) {
            return {
                statusCode: 400,
                body: result.body
            }
        }

        return {
            statusCode: 200,
            body: result.body
        }
    } catch (err) {
        console.log('err login', err);
        return {
            statusCode: 500,
            body: err.message
        };
    }
};

module.exports.hello = async (event, context, cb) => {
    try {
        console.log('hello');
        return {
            statusCode: 200,
            body: 'Hello 123'
        };
    } catch (err) {
        console.log('err hello', err);
        return {
            statusCode: 500,
            body: err.message
        };
    }
};