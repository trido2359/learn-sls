'use strict';

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
// refer to:        http://amzn.to/2fo77UI

const ISS = 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_bfYJXG8re';
const token = 'eyJraWQiOiJvZTRqQThsL2hGQW1YOE0yai9ySldhTTcwVDNPSm5VV1E1bnNTZUJ3OHJrPSIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiI1MTMzZjI4MC0zMmMxLTQ0NjgtYTk5Ny0xNjdhOTQ5YTk2YzQiLCJjb2duaXRvOmdyb3VwcyI6WyJhcC1zb3V0aGVhc3QtMV9iZllKWEc4cmVfRmFjZWJvb2siXSwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwiLCJhdXRoX3RpbWUiOjE1OTU1NjEwNzEsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbS9hcC1zb3V0aGVhc3QtMV9iZllKWEc4cmUiLCJleHAiOjE1OTU1NjQ2NzEsImlhdCI6MTU5NTU2MTA3MSwidmVyc2lvbiI6MiwianRpIjoiYWMyOTkzYTYtYTQ0NS00NTZmLWFjMzItY2Y3MjIzNjRjNTQ1IiwiY2xpZW50X2lkIjoiNHJ0bHFkaXNrbnU2bWFqNWJxaTM1NmdkZGkiLCJ1c2VybmFtZSI6ImZhY2Vib29rXzI3MzAyNzY5NjA1ODkxMDcifQ.zu9LP5cWrAJzRBHFBB03CBopkpM4yfbRrHAaUUj1yFI';



module.exports.test = async event => {
    console.log('Test111');
    
    return {
        statusCode: 200,
        body: 'Test'
    };

};

module.exports.hello =  async event => {
    console.log('hello'); 
    console.log(event);
    try {
        return {
            statusCode: 200,
            body: 'Hello 123'
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Hello Err'
        };
    }
};