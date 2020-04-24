/* tslint:disable */
/* eslint-disable */
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  console.log(event.request);

  console.log('create OTP');
  //Create a random number for otp
  const challengeAnswer = Math.random().toString(10).substr(2, 6);
  const phoneNumber = event.request.userAttributes.phone_number;

  console.log('sns SNS');
  //sns sms
  const sns = new AWS.SNS({ region: 'us-east-1' });
  sns.publish(
    {
      Message: 'your otp: ' + challengeAnswer,
      PhoneNumber: phoneNumber,
      MessageStructure: 'string',
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'Dumby101',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    },
    function (err, data) {
      if (err) {
        console.log(err.stack);
        console.log(data);
        return;
      }
      console.log(`SMS sent to ${phoneNumber} and otp = ${challengeAnswer}`);
      return data;
    }
  );

  console.log('set return params');
  //set return params
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = challengeAnswer;
  event.response.challengeMetadata = 'CUSTOM_CHALLENGE';

  callback(null, event);
};
