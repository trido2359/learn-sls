'use strict';
global.fetch = require('node-fetch');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { handler } = require("./libs/handler-lib");
const { dbState } = require("./libs/dynamodb-lib");

global.navigator = () => null;
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
    UserPoolId: "ap-southeast-1_AqI7W18Qk",
    ClientId: "32ba2gqtadf1nugo7c8hgelou1"
};
const identityPoolId = 'ap-southeast-1:3e2d313f-e3e6-4438-80c2-801f41b6cd41';
const pool_region = "ap-southeast-1";
const x = "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_AqI7W18Qk"
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

module.exports.register = async (event, context) => {
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
            body: 'register done'
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


module.exports.verifyAccount = async (event, context) => {
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

                AWS.config.region = pool_region;

                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: identityPoolId,
                    Logins: {
                        'cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_AqI7W18Qk': 
                        result.getIdToken().getJwtToken()
                    }
                });

                // Obtain AWS credentials
                AWS.config.credentials.get(function () {
                    // Credentials will be available when this function is called.
                    const accessKeyId = AWS.config.credentials.accessKeyId;
                    const secretAccessKey = AWS.config.credentials.secretAccessKey;
                    const sessionToken = AWS.config.credentials.sessionToken;

                    resolve({
                        status: 1,
                        body: sessionToken
                    })

                });

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

module.exports.login = async (event, context) => {
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

module.exports.hello = async (event, context) => {
    try {
        console.log(process.env.ExtAttachmentsBucket);
        
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


module.exports.create = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const params = {
      TableName: process.env.tableName,
      // 'Item' contains the attributes of the item to be created
      // - 'userId': user identities are federated through the
      //             Cognito Identity Pool, we will use the identity id
      //             as the user id of the authenticated user
      // - 'noteId': a unique uuid
      // - 'content': parsed from request body
      // - 'attachment': parsed from request body
      // - 'createdAt': current Unix timestamp
      Item: {
        userId: event.requestContext.identity.cognitoIdentityId,
        noteId: uuidv4(),
        content: data.content,
        attachment: data.attachment,
        createdAt: Date.now()
      }
    };

    console.log(params);
    
  
    await dbState.put(params);
  
    return params.Item;
  });

module.exports.get = handler(async (event, context) => {
    const params = {
        TableName: process.env.tableName,
        // 'Key' defines the partition key and sort key of the item to be retrieved
        // - 'userId': Identity Pool identity id of the authenticated user
        // - 'noteId': path parameter
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            noteId: event.pathParameters.id
        }
    };

    const result = await dbState.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }

    // Return the retrieved item
    return result.Item;
});