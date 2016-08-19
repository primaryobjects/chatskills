var chatskills = require('./lib/chatskills');
var readlineSync = require('readline-sync');

// Create a skill.
var hello = chatskills.app('hello');

// Launch method to run at startup.
hello.launch(function(req,res) {
    res.say("Ask me to say hi!");

    // Keep session open.
    res.shouldEndSession(false);
});

// Create an intent.
hello.intent('helloWorld', {
    'slots': {},
    'utterances': [ '{to |}{say|speak|tell me} {hi|hello|howdy|hi there|hiya|hi ya|hey|hay|heya}' ]
    },
    function(req, res) {
        res.say('Hello, World!');
    }
);

// Start running our skill.
chatskills.launch(hello);

// Console client.
var text = ' ';
while (text.length > 0 && text != 'quit') {
    text = readlineSync.question('> ');

    // Respond to input.
    chatskills.respond(text, function(response) {
        console.log(response);
    });
}