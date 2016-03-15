var readlineSync = require('readline-sync');
var chatskills = require('./lib/chatskills');

// Create a new skill.
var hello = chatskills.add('hello');
var goodbye = chatskills.add('goodbye');
var horoscope = chatskills.add('horoscope');

// Create a new intent.
hello.intent('sayHello', {
    "slots": {},
    "utterances": [ "{hi|hello|howdy|hi there|hiya|hi ya|hey|hay}" ]
    },
    function(req, res) {
        res.say("Hi! What's your name?");
    }
);

hello.intent('*', {
    "slots": {},
    "utterances": [ "{*}" ]
    },
    function(req, res) {
        res.say("What?");
    }
);

goodbye.intent('sayBye', {
    "slots": {},
    "utterances": [ "{quit|exit|bye|seeya|see ya|later|goodbye|good bye|good-bye}" ]
    },
    function(req, res) {
        res.say("Bye!");
    }
);

horoscope.intent('predict', {
    'slots': {'SIGN':'LITERAL'},
    'utterances': [ 'to predict {sign|SIGN}' ]
    },
    function(req, res) {
        res.say('Things are looking up today for ' + req.get('SIGN'));
    }
);

// Example client.
var text = ' ';
while (text.length > 0 && text != 'quit') {
    text = readlineSync.question(':> ');

    // Respond to what was typed.
    chatskills.respond(text, function(response) {
        console.log(response);
    });
}