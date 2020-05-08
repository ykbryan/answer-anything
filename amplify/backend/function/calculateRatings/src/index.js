/* Amplify Params - DO NOT EDIT
	API_ANSWERANYTHING_GRAPHQLAPIENDPOINTOUTPUT
	API_ANSWERANYTHING_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const https = require('https');
const urlParse = require('url').URL;
var region = process.env.REGION;
var apiAnsweranythingappGraphQLAPIEndpointOutput =
  process.env.API_ANSWERANYTHING_GRAPHQLAPIENDPOINTOUTPUT;
const endpoint = new urlParse(
  apiAnsweranythingappGraphQLAPIEndpointOutput
).hostname.toString();

exports.handler = async (event) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  console.log(
    process.env.API_ANSWERANYTHING_GRAPHQLAPIENDPOINTOUTPUT,
    process.env.API_ANSWERANYTHING_GRAPHQLAPIIDOUTPUT,
    process.env.ENV,
    process.env.REGION
  );
  const rooms = await listRooms();
  return response;
};

async function listRooms() {
  const graphqlQuery = `query listRooms {
        listRooms (limit: 100) {
          items {
            id
            title
            rating
            _version
            _deleted
            messages {
              items {
                id
              }
              nextToken
              startedAt
            }
          }
        }
      }`;

  // console.log(graphqlQuery);
  const data = await makeRequest(graphqlQuery, 'listRooms');
  // console.log(data);

  if (data) {
    // console.log(data.data.listRooms.items)

    for (let key in data.data.listRooms.items) {
      let room = data.data.listRooms.items[key];
      // console.log(room)
      if (!room['_delete']) {
        // console.log(room)
        if (room.rating !== room.messages.items.length) {
          await updateRoomRating(
            room.id,
            room.messages.items.length,
            room['_version']
          );
        }
      }
    }
  }

  return data;
}

async function getMessage(messageId) {
  const graphqlQuery = `query getMessage {
      getMessage (id: "${messageId}") {
        id
        content
        room {
          id
          rating
        }
      }
    }`;

  console.log(graphqlQuery);

  const data = await makeRequest(graphqlQuery, 'getMessage');
  return data;
}

async function setRating(roomId, rating) {
  const graphqlMutation = `mutation updateRoom {
      updateRoom(input: {
        id:"${roomId}"
        rating: ${rating}
      }) {
        id
        rating
        status
        createdAt
        _version
      }
    }`;

  console.log(graphqlMutation);

  const data = await makeRequest(graphqlMutation, 'updateRoom');
  return data;
}

async function updateRoomRating(roomId, rating, version) {
  const graphqlMutation = `mutation updateRoom {
      updateRoom(input: {
        id:"${roomId}"
        rating: ${rating}
        _version: ${version}
        updatedAt: "${new Date().toJSON()}"
      }) {
        id
        rating
        status
        createdAt
        _version
      }
    }`;

  console.log(graphqlMutation);
  const data = await makeRequest(graphqlMutation, 'updateRoom');
  console.log(data);
  return data;
}

async function makeRequest(query, operationName) {
  const req = new AWS.HttpRequest(
    apiAnsweranythingappGraphQLAPIEndpointOutput,
    region
  );

  req.method = 'POST';
  req.headers.host = endpoint;
  req.headers['Content-Type'] = 'application/json';
  req.body = JSON.stringify({
    query: query,
    operationName: operationName,
  });

  const signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());

  const data = await new Promise((resolve, reject) => {
    const httpRequest = https.request({ ...req, host: endpoint }, (result) => {
      result.on('data', (data) => {
        resolve(JSON.parse(data.toString()));
      });
    });

    httpRequest.write(req.body);
    httpRequest.end();
  });

  return data;
}
