var readlineSync = require('readline-sync');
var alexa = require('alexa-app');

var app = new alexa.app('sample');

app.intent('askName',
  {
    "slots": {"NAME":"LITERAL", "LASTNAME":"LITERAL"},
    "utterances": [ "my {name is|name's|names} {name|NAME}",
                    "my last {name is|name's|names} {lastname|LASTNAME}",
                    "{whats|what's|what is} my name{?|}" ]
  },
  function(req, res) {
    if (req.variables.length == 0 && req.get('NAME') && req.get('LASTNAME')) {
        res.say('Your name is ' + req.get('NAME') + ' ' + req.get('LASTNAME') + '.');
    }
    else if (req.variables.length > 0) {
        if (req.get('LASTNAME') && !req.get('NAME')) {
            res.say('Ok, ' + req.get('LASTNAME') + '.');
        }
        else if (req.get('NAME')) {
            res.say('Nice to meet you, ' + req.get('NAME') + '.');
        }
    }
    else {
        res.say("I still don't know your name!");
    }
  }
);

app.intent('color',
  {
    "slots": {"COLOR":"LITERAL"},
    "utterances": [ "my {favorite|best|} color is {color|COLOR}",
                    "whats my {favorite|best|} color {?|}" ]
  },
  function(req, res) {
    if (req.get('COLOR')) {
        res.say('Your favorite color is ' + req.get('COLOR') + '.');
    }
  }
);

app.intent('hello',
  {
    "slots": {},
    "utterances": [ "{hi|hello|howdy|hi there|hiya|hi ya|hey|hay}" ]
  },
  function(req, res) {
    res.say("Hi! What's your name?");
  }
);

app.intent('quit',
  {
    "slots": {},
    "utterances": [ "{quit|exit|bye|seeya|see ya|later|goodbye|good bye|good-bye}" ]
  },
  function(req, res) {
    res.say("Bye!");
  }
);

//console.log(app.utterances());
//console.log(app.intents['askName'].schema.slots[Object.keys(app.intents['askName'].schema.slots)[0]]);
var slots = {};

function process(input) {
    Object.keys(app.intents).forEach(function(key) {
        // Get utterances for this intent.
        var utterances = [];
        app.utterances().split('\n').forEach(function(template) {
            // Get the intent name from this template line.
            var matches = template.match(/([a-zA-Z0-9]+)\t/);
            if (matches && matches[1] == key) {
                // The intent matches ours, let's use it. First, strip out intent name.
                var start = template.indexOf('\t');
                template = template.substring(start + 1);

                // Add this utterance for processing.
                utterances.push(template);
            }
        });

        var result = parse(input, utterances);
        if (result.isValid) {
            // This intent is valid for the input. Set slots.
            for (var i in result.pairs) {
                var pair = result.pairs[i];
                slots[pair.name] = pair.value;
            };

            // Call intent.
            app.intents[key]['function'](
                {
                    // Request
                    input: input,
                    slots: slots,
                    variables: result.pairs,

                    get: function(key) {
                        return slots[key];
                    },

                    set: function(key, value) {
                        slots[key] = value;
                    }
                },
                {
                    // Response
                    say: function(text) {
                        console.log(text);
                    }
                }
            );
        }
    });
}

function parse(text, utterances) {
    var result = { isValid: true, pairs: [] };

    for (var h in utterances) {
        var template = utterances[h];
        var regEx = /[ \n\r\t,\.\!`~@#\$%\^\&\*\(\)\[\]:;\"\?\/\\\<\_\-\+\=>]+/;

        result.isValid = true;

        if (template && template.length > 0) {
            //console.log('Template: ' + template);
            //console.log('Text: ' + text);

            // Find all variables and fill in values.
            var tokens = template.split(regEx);
            var words = text.split(regEx);

            if (tokens.length == words.length) {
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i];
                    var word = words[i];

                    //console.log('Token: ' + token);
                    //console.log('Word: ' + word);

                    if (token.toLowerCase() != word.toLowerCase()) {
                        // A word doesn't match, but is it a variable?
                        var tokenParts = token.match(/{([a-zA-Z0-9]+)\|([a-zA-Z0-9]+)}/);
                        if (tokenParts && tokenParts.length == 3) {
                            //console.log(tokenParts[2] + ' = ' + word);
                            // Found a variable.
                            result.pairs.push({ name: tokenParts[2], value: word });
                        }
                        else {
                            result.isValid = false;
                            break;
                        }
                    }
                }
            }
            else {
                result.isValid = false;
                continue;
            }
        }
        else {
            result.isValid = false;
        }

        if (result.isValid) {
            break;            
        }
    };

    return result;
}

var text = ' ';
while (text.length > 0 && text != 'quit') {
    text = readlineSync.question(':> ');
    process(text);
}