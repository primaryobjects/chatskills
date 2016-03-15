var alexa = require('alexa-app');

var ChatSkillsManager = {
    verbose: false,
    id: 'Chatskills',
    sessions: {},
    apps: {},

    name: function(name) {
        this.id = name;
    },

    add: function(namespace) {
        // Add a new skill (app namespace).
        this.apps[namespace] = new alexa.app(namespace);

        return this.apps[namespace];
    },

    app: function(namespace) {
        return this.apps[namespace];
    },

    respond: function(input, sessionId, callback) {
        if (typeof sessionId == 'function') {
            // No sessionId provided, default to 1 (localhost).
            callback = sessionId;
            sessionId = 1;
        }

        var session = this.sessions[sessionId];
        var app = null;

        var regEx = new RegExp(this.id + '[,\\-\\!\\? ]+ask ([a-zA-Z0-9]+)[,\\. ](.*)', 'i');
        var matches = input.match(regEx);

        // Determine a skill to start: "[bot], ask [namespace] [input]".
        if (matches && matches.length == 3) {
            var namespace = matches[1];
            input = matches[2];

            // It's a request for our bot.
            app = this.apps[namespace];
            if (!app) {
                if (this.verbose) {
                    console.log("Error: The skill '" + namespace + "' doesn't exist. Add one using: chatskills.add('" + namespace + "')");
                }
                return;
            }
            else {
                // We've started a skill! Establish a new session.
                this.sessions[sessionId] = {
                    id: sessionId,
                    app: app,
                    slots: {}
                };

                session = this.sessions[sessionId];

                if (this.verbose) {
                    console.log('Session ' + sessionId + ' started.');
                }
            }
        }
        else if (!session) {
            // Not a request for our bot.
            if (this.verbose) {
                console.log("Info: Ignoring. Example request: '" + this.id + ", ask SKILL_NAME text'.");
            }
            return;
        }
        else {
            // Continue existing session.
            app = session.app;
        }

        // Go through each intent in the skill to find a valid response.
        for (var i in Object.keys(app.intents)) {
            var key = Object.keys(app.intents)[i];

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

            var result = ChatSkillsManager.parse(input, utterances);
            if (result.isValid) {
                // This intent is valid for the input. Set slots.
                for (var j in result.pairs) {
                    var pair = result.pairs[j];
                    session.slots[pair.name] = pair.value;
                };

                // Call intent.
                var continueSession = app.intents[key]['function'](
                {
                    // Request
                    input: input,
                    slots: session.slots,
                    variables: result.pairs,

                    get: function(key) {
                        return session.slots[key];
                    },

                    set: function(key, value) {
                        session.slots[key] = value;
                    }
                },
                {
                    // Response
                    say: function(text) {
                        if (callback) {
                            callback(text);
                        }
                    }
                });

                if (!continueSession) {
                    // Intent returned false, so end the session.
                    delete this.sessions[sessionId];

                    if (this.verbose) {
                        console.log('Session ' + sessionId + ' ended.');
                    }
                }

                // We've already found a valid intent, skip processing the rest. This prevents multiple responses from the same text.
                break;
            }
        }
    },

    parse: function(text, utterances) {
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
                var words = text.split(regEx).filter(function(e) { return e }); // remove empty strings.

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
};

module.exports = ChatSkillsManager;