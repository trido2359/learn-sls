
const util = require('./util');

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

module.exports.authorize = async (event, context, cb) => {
    console.log('authorize11');
    const token = event.authorizationToken.substring(7);
    
    if (!token) {
      return {
        statusCode: 400,
        body: 'Not found token'
    };
    }
    const authorize = await util.validateToken(token);
    const ARN = "arn:aws:execute-api:ap-southeast-1:890191265537:cbn7bpny75/*/GET/";
    return generatePolicy(authorize.sub, 'Allow', ARN);
}