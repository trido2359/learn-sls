
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
    // return policy statement that allows to invoke the connect function.
    // in a real world application, you'd verify that the header in the event
    // object actually corresponds to a user, and return an appropriate statement accordingly
    const resource = "arn:aws:execute-api:ap-southeast-1:890191265537:cbn7bpny75/*/GET/";
    const policy = generatePolicy('user', 'Allow', resource);
    return policy;
}