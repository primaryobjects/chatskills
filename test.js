var readlineSync = require('readline-sync');
var chatskills = require('./lib/chatskills');

// Create a new skill.
var hello = chatskills.add('hello');
var goodbye = chatskills.add('goodbye');
var horoscope = chatskills.add('horoscope');
var funny = chatskills.add('funny');

// Create a new intent.
hello.intent('sayHello', {
    'slots': {},
    'utterances': [ '{hi|hello|howdy|hi there|hiya|hi ya|hey|hay}' ]
    },
    function(req, res) {
        res.say('Hi!');
    }
);

hello.intent('*', {
    'slots': {},
    'utterances': [ '{*}' ]
    },
    function(req, res) {
        res.say('What?');
        return true;
    }
);

goodbye.intent('sayBye', {
    'slots': {},
    'utterances': [ '{quit|exit|bye|seeya|see ya|later|goodbye|good bye|good-bye}' ]
    },
    function(req, res) {
        res.say('Bye!');
    }
);

horoscope.intent('predict', {
    'slots': {'SIGN':'LITERAL'},
    'utterances': [ 'for {sign|SIGN}' ]
    },
    function(req, res) {
        res.say('Things are looking up today for ' + req.get('SIGN'));
    }
);

funny.intent('knockKnock', {
    'slots': {'STATE':'NUMBER'},
    'utterances': [ '{to |}{tell|say} {me |} {a |}joke',
                    '{banana|bannana|banan|bana|bannanna|bannananna} who' ]
    },
    function(req, res) {
        var state = req.get('state') || 0;
        if (state < 3) {
            req.set('state', state + 1);
            res.say('Knock knock.');
        }

        return true;
    }
);

funny.intent('banana', {
    'slots': {'STATE':'NUMBER'},
    'utterances': [ "{whos|who's|who is} there" ]
    },
    function(req, res) {
        var state = req.get('state');
        if (state < 2) {
            res.say('Banana.');
        }
        else if (state == 3) {
            res.say('Orange.');
        }

        req.set('state', state + 1);

        return true;
    }
);

funny.intent('orange', {
    'slots': {'STATE':'NUMBER'},
    'utterances': [ "{orange|oronge|arange} who" ]
    },
    function(req, res) {
        if (req.get('state') == 4) {
            res.say("Orange you glad I didn't say banana?");

            // End session.
            return false;
        }
        else {
            return true;
        }
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