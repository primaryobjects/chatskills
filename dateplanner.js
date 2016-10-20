//
// Example of using a dictionary to allow the user to choose from a pre-selected list of values in a custom slot type.
//
var chatskills = require('./lib/chatskills');

// Create a new skill.
var dateplanner = chatskills.add('dateplanner');

dateplanner.dictionary = { "yesNo": [ 'yes', 'no' ] };

dateplanner.intent('run', {
        "slots": {},
        "utterances": ["{to|} {run|start|go|launch}"]
    }, function(req, res) {
        var prompt = "What date would you like to book?";
        res.say(prompt).reprompt(prompt).shouldEndSession(false);
    }
);

// Example using the built-in slot type: AMAZON.DATE.
dateplanner.intent('getDate',{
        "slots":{"Date":"AMAZON.DATE"}
        ,"utterances":["{-|Date}",
                       "book {-|Date}",
                       "I choose {-|Date}"]
    },
    function(req,res) {
      // Store the date.
      res.session('Date', req.slot('Date'));

      res.say('What time will the event start?');
      res.shouldEndSession(false);
    }
);

// Example using the built-in slot type: AMAZON.TIME.
dateplanner.intent('getTime',{
        "slots":{"Time":"AMAZON.TIME"}
        ,"utterances":["{-|Time}",
                       "at {-|Time}"]
    },
    function(req,res) {
      // Store the time.
      res.session('Time', req.slot('Time'));

      res.say('How many guests will be attending?');
      res.shouldEndSession(false);
    }
);

// Example using the built-in slot type: AMAZON.NUMBER.
dateplanner.intent('getNumber',{
        "slots":{"GuestCount":"AMAZON.NUMBER"}
        ,"utterances":["{-|GuestCount}",
                       "about {-|GuestCount}",
                       "{-|GuestCount} guests",
                       "{-|GuestCount} people",
                       "There will be {-|GuestCount} guests"]
    },
    function(req,res) {
      // Store the guest count.
      res.session('GuestCount', req.slot('GuestCount'));

      if (req.session('Date') && req.session('Time')) {
        res.say("Your event will be on " + req.session('Date') + " at " + req.session('Time') + " and you are inviting " + req.slot('GuestCount') + " guests. Is this correct?");
      }
      else {
        // User has not provided all info yet.
        res.say("You are inviting " + req.slot('GuestCount') + " guests. What date would you like to book?").shouldEndSession(false);
      }

      res.shouldEndSession(false);
    }
);

dateplanner.intent('confirm', {
    'slots': { "Confirm": "YESNO" },
    'utterances': [ '{yesNo|Confirm}' ]
    },
    function(req, res) {
      if (req.session('GuestCount') && req.session('Date')) {
        if (req.slot('Confirm').toLowerCase() == 'yes') {
          res.say("Great! Your event is successfully booked.").shouldEndSession(true);
        }
        else {
          // User wants to start over.
          res.say("What date would you like to book?").shouldEndSession(false);
        }
      }
      else {
        // User has not provided all info yet.
        res.say("What date would you like to book?").shouldEndSession(false);
      }
    }
);