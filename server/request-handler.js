var utils = require('./utils');

var objectIdCounter = 1;
var messages = [
  // {
  //   text: 'Hello World',
  //   username: 'Evaline',
  //   objectId: objectIdCounter
  // }
];

var actions = {
  'GET': function(request, response) {
    utils.sendResponse(response, {results: messages});
  },
  'POST': function(request, response) {
    utils.collectData(request, function(message) {
      message.objectId = ++objectIdCounter;
      messages.push(message);
      utils.sendResponse(response, {objectId: message.objectId}, 201);
    });
  },
  'OPTIONS': function(request, response) {
    utils.sendResponse(response, null);
  }
};

exports.requestHandler = utils.makeActionHandler(actions);