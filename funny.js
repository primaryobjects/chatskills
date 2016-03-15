var chatskills = require('./lib/chatskills');

// Create a new skill.
var funny = chatskills.add('funny');

// Create intents.
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