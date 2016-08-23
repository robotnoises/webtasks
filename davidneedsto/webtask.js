'use strict';

var crypto = require('crypto');

/**
 * Represents an Event to be scheduled in Google Calendar
 */
function Event(matchedPhrase) {
  if (matchedPhrase) {
    this.who = matchedPhrase[1];
    this.what = matchedPhrase[2];
    this.when = new Date(matchedPhrase[3]);
    this.valid = !!this.who && !!this.what && !!this.when;
  }
}

/**
 * Represents a "Chat" as designated in Gmail and a list of "Events" that are parsed from the message body
 */
function Chat(messageBody) {
  if (messageBody) {
    this.messageBody = messageBody;
  } else {
    throw new Error('messageBody is required.');
  }
}

/**
 * Get a list of Events from the message body
 */
Chat.prototype.getEvents = function () {
  // Matches (someone) needs to "(some action)" on "(some date)" at "(time)"
  var taskMatcher = /(\w+)\s\bneeds\b\s\bto\b\s"([\w\s]+)"\s\bon\b\s"([a-z\s0-9,]+)"\s\bat\b\s"([amp\s0-9:]+)"/;
  var matcher = new RegExp(taskMatcher, 'gi');
  var events = [];

  // Push an Event onto the event list and reset the lastIndex property
  function addEvent(match) {
    var event = new Event(matcher.exec(match));
    if (event.valid) events.push(event);
    matcher.lastIndex = 0;
  }

  this.messageBody.replace(matcher, addEvent.bind(this));
  return events;
};

/**
 * Create a hash representing a scheduled Event.
 */
function hashEvent(event) {
  if (event.valid) {
    var hash = crypto.createHash('sha256');
    return hash.update(event.who + event.what + event.when);
  }
}

/**
 * The Webtask
 */
module.exports = function (context, doneCallback) {
  // Perform the 
};