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

// Example client.
var text = ' ';
while (text.length > 0 && text != 'quit') {
    text = readlineSync.question('> ');

    // Respond to what was typed.
    chatskills.respond(text, function(response) {
        console.log(response);
    });
}