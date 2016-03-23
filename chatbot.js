var readlineSync = require('readline-sync');
var chatskills = require('./lib/chatskills');
var mitsuku = require('mitsuku-api')();

// Create a new skill.
var chatbot = chatskills.add('chatbot');

// Create intents.
chatbot.intent('start', {
    'slots': {},
    'utterances': [ '{to |}{start|run|go|talk|chat}' ]
    },
    function(req, res) {
        res.say('What shall we talk about?');

        // Keep session alive.
        return true;
    }
);

chatbot.intent('*', {
    'slots': {},
    'utterances': [ '{*}' ]
    },
    function(req, res) {
        mitsuku.send(req.input).then(function(response) {
            res.say(response);
        });

        // Keep session alive.
        return true;
    }
);

//
// Get input from the user and respond.
// Note, since we're calling an async method (mitsuku.send) and we're using a sync method (readlineSync), we have to handle our main loop in an async fashion.
//
function main() {
    var text = readlineSync.question('> ');

    if (text != 'quit') {
        // Respond to input.
        chatskills.respond(text, function(response) {
            console.log(response);
            main();
        });
    }
}

// Start the 'chatbot' skill immediately, to fire up the chatbot.
chatskills.respond('chatskills, ask chatbot to start', function(response) {
    main();
});