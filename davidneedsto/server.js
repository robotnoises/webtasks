 
'use strict';

let express = require('express');
let app = express();

console.log('Starting.');

app.use(express.Router());

app.listen(process.env.PORT || 8000, () => {
  console.log('Server started.');
});

//////////////////////////////////////////////////////////////

let google = require('googleapis');
let calendar = google.calendar('v3');
let apiKey = process.env.DAVIDNEEDSTO_KEY || '';

calendar.events.list({
  auth: apiKey,
  calendarId: 'primary',
  timeMin: (new Date()).toISOString(),
  maxResults: 10,
  singleEvents: true,
  orderBy: 'startTime'
}, function (err, response) {
  if (err) {
    console.log('The API returned an error: ' + err);
    return;
  }
  var events = response.items;
  if (events.length == 0) {
    console.log('No upcoming events found.');
  } else {
    console.log('Upcoming 10 events:');
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var start = event.start.dateTime || event.start.date;
      console.log('%s - %s', start, event.summary);
    }
  }
});

// plus.people.get({
//   'auth': apiKey, 
//   'userId': '+DavidNicholsJS'
// }, (err, user) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(user);
//   } 
// });
