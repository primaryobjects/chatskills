/*
Build a chatbot using Alexa-style skills and intents.

Copyright (c) 2016 Kory Becker
http://primaryobjects.com/kory-becker

License MIT
*/

var alexa = require('alexa-app');

var ChatSkillsManager = {
    verbose: false,
    timeout: 3600, // session timeout in seconds (0 to disable)
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

    expire: function(sessionId) {
        var session = this.sessions[sessionId];
        if (session && this.timeout) {
            var difference = (new Date() - session.date) / 1000;
            if (difference > this.timeout) {
                // Session expired.
                if (this.verbose) {
                    console.log('Session ' + session.id + ' expired.');
                }

                delete this.sessions[sessionId];
            }
        }

        return this.sessions[sessionId];
    },

    session: function(input, sessionId) {
        // Get the current session and manage session expiration.
        var session = this.expire(sessionId);
        var regEx = new RegExp(this.id + '[,\\-\\!\\? ]+ask ([a-zA-Z0-9]+)[,\\. ](.*)', 'i');
        var matches = input.match(regEx);

        // Determine a skill to start: "[bot], ask [namespace] [input]".
        if (matches && matches.length == 3) {
            // It's a request for our bot.
            var namespace = matches[1];
            input = matches[2];

            // See if a skill exists with this namespace.
            var app = this.apps[namespace];
            if (!app) {
                // Skill not found.
                if (this.verbose) {
                    console.log("Error: The skill '" + namespace + "' doesn't exist. Add one using: chatskills.add('" + namespace + "')");
                }
                return;
            }
            else {
                // We've started a skill! Establish a new session.
                session = this.sessions[sessionId] = {
                    id: sessionId,
                    date: new Date(),
                    app: app,
                    input: input,
                    slots: {}
                };

                if (this.verbose) {
                    console.log('Session ' + sessionId + ' started.');
                }
            }
        }
        else if (!session) {
            // Not a request for our bot and no existing session.
            if (this.verbose) {
                console.log("Info: Ignoring. Example request: '" + this.id + ", ask SKILL_NAME text'.");
            }
            return;
        }
        else {
            // Continue existing session.
            session.date = new Date();
            session.input = input;
        }

        return session;
    },

    respond: function(input, sessionId, callback) {
        if (typeof sessionId == 'function') {
            // No sessionId provided, default to 1 (localhost).
            callback = sessionId;
            sessionId = 1;
        }

        // If no sessionId and no callback provided, set a default sessionId.
        sessionId = sessionId || 1;

        // Get a new or existing session.
        var session = this.session(input, sessionId);
        if (session) {
            var app = session.app;
            input = session.input;
            var result = null;

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

                result = ChatSkillsManager.parse(input, utterances, app.intents[key].schema.slots);
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

            if (!result || !result.isValid) {
                if (callback) {
                    callback();
                }
            }
        }
        else {
            if (callback) {
                callback();
            }
        }
    },

    parse: function(text, utterances, slots) {
        var result = { isValid: true, pairs: [] };

        for (var h in utterances) {
            var template = utterances[h];
            var regEx = /[ \n\r\t,\!`\(\)\[\]:;\"\?\/\\\<\+\=>]+/;
            result = { isValid: true, pairs: [] };

            if (template && template.length > 0) {
                //console.log('Template: ' + template);
                //console.log('Text: ' + text);

                // Remove leading and trailing periods.
                text = text.replace(/(^\.+)|(\.+$)/g, '');

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
                                var name = tokenParts[2];

                                // Check if the value matches the variable type.
                                var isValidType = true;
                                var type = slots[name];
                                switch (type) {
                                    case 'NUMBER': isValidType = parseFloat(word); break;
                                    case 'DATE': isValidType = Date.parse(word); break;
                                    case 'LITERAL': isValidType = true; break;
                                };

                                if (isValidType) {
                                    // It's a valid variable and type.
                                    result.pairs.push({ name: name, value: word });
                                }
                                else {
                                    // It's a variable, but the type is wrong (ie., text supplied where a number should be, etc).
                                    result.isValid = false;
                                    break;
                                }
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