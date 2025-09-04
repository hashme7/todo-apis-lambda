import AWS from "aws-sdk"; // still works, aws-sdk v2 is CJS-compatible
AWS.config.update({ region: "us-east-1" });

const cognito = new AWS.CognitoIdentityServiceProvider();
const CLIENT_ID = "5oobhipm5qa813i77h7p83n3cs";

export async function addUser({ username, email, password }) {
  const params = {
    ClientId: CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
    ]
  };

  return cognito.signUp(params).promise();
}

export async function verifyUser({ confirmationCode, username }) {
  const params = { ClientId: CLIENT_ID, Username: username, ConfirmationCode: confirmationCode };
  return cognito.confirmSignUp(params).promise();
}
