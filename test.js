var readlineSync = require('readline-sync');
var chatskills = require('./lib/chatskills');

// Create a new skill.
var hello = chatskills.add('hello');

// Create a new intent.
hello.intent('helloWorld', {
    'slots': {},
    'utterances': [ '{to |}{say|speak|tell me} {hi|hello|howdy|hi there|hiya|hi ya|hey|hay|heya}' ]
    },
    function(req, res) {
        res.say('Hello, World!');
    }
);

// Include some other skills.
require('./funny');
require('./horoscope');
require('./favoritecolor');

console.log('Welcome, here are some available commands to try:\nchatskills, ask hello to say hi\nchatskills, ask horoscope for Aries\nchatskills, ask funny to tell a joke\nchatskills, ask favoritecolor to run\n');

// Example client.
var text = ' ';
while (text.length > 0 && text != 'quit') {
    text = readlineSync.question('> ');

    // Respond to what was typed.
    chatskills.respond(text, function(response) {
        console.log(response);
    });
}