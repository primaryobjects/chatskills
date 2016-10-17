var chatskills = require('./lib/chatskills');

// Create a new skill.
var pickFruit = chatskills.add('pickfruit');

pickFruit.dictionary = { "fruits": [ 'banana', 'orange', 'apple' ] };

pickFruit.intent('run', {
        "slots": {},
        "utterances": ["{to|} {run|start|go|launch}"]
    }, function(req, res) {
        var prompt = "Select a fruit: banana, orange, apple.";
        res.say(prompt).reprompt(prompt).shouldEndSession(false);
    }
);

// Using the Custom Slot Type "ColorType".
pickFruit.intent('color',{
        "slots":{"FruitType":"FRUITTYPE"}
        ,"utterances":["I choose {fruits|FruitType}",
                       "{fruits|FruitType}"]
    },
    function(req,res) {
        res.say("You selected " + req.slot('FruitType') + '!');
        res.shouldEndSession(true);
    }
);

pickFruit.intent('*', {
    'slots': {},
    'utterances': [ '{*}' ]
    },
    function(req, res) {
        res.say("I'm sorry, I'm not familiar with that fruit. Please pick a fruit: banana, orange, apple.");
        return true;
    }
);