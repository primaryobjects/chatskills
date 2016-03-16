var chatskills = require('./lib/chatskills');

// Create a new skill.
var horoscope = chatskills.add('horoscope');

// Create intents, using a dictionary.
horoscope.dictionary = {"signs":['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']};
horoscope.intent('predict', {
    'slots': {'SIGN':'LITERAL'},
    'utterances': [ 'for {signs|SIGN}',
                    '{signs|SIGN}' ]
    },
    function(req, res) {
        var sign = req.get('SIGN');
        if (horoscope.dictionary['signs'].indexOf(sign.toLowerCase()) != -1) {
            res.say('Things are looking up today for ' + req.get('SIGN') + '.');
        }
        else {
            res.say("I'm not familiar with that zodiac sign.");
            return true;
        }
    }
);

horoscope.intent('*', {
    'slots': {},
    'utterances': [ '{*}' ]
    },
    function(req, res) {
        res.say('What is your zodiac sign?');
        return true;
    }
);