
module.exports.authorize = async (event, context, cb) => {
    console.log('authorize');
    // return policy statement that allows to invoke the connect function.
    // in a real world application, you'd verify that the header in the event
    // object actually corresponds to a user, and return an appropriate statement accordingly
    return {
        "principalId": "user",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Allow",
                    "Resource": "arn:aws:execute-api:ap-southeast-1:890191265537: cbn7bpny75/*/GET/"
                }
            ]
        }
    };
}