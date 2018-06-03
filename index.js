const request = require('request');
const AWS = require('aws-sdk');

const sendSNS = (departureTime, cb) => {
  const sns = new AWS.SNS();
  sns.publish({
    Message: `${departureTime} Ticket Available!`,
    Subject: `${departureTime} Ticket Available`,
    TopicArn: 'arn:aws:sns:ap-southeast-1:xxxxxxxxxxxxxx:ktmb-2018'
  }, cb);
};

exports.handler = (event) => {
  request({
    url: 'https://intranet.ktmb.com.my/e-ticket/api/GETCONNECTINGV2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: {
      "Origin": "37600",
      "Destination": "37500",
      "DateJourney": event.date,
      "Direction": "O",
      "NoAdult": "1",
      "Nochild": "0",
      "TimeRange": "NI"
    },
    json: true
  }, (error, response, body) => {
    if (error) {
      console.error(error);
    }
    if (body.ConnectingList) {
      const tripList = body.ConnectingList[0].TripList;
      if (tripList) {
        const trip8pm = tripList.find(trip => trip.TrainNumber === '88');
        if (trip8pm) {
          console.log('8pm train found.');
          sendSNS(trip8pm.DepartureTime, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log('Email sent.')
            }
          });
        } else {
          console.log('No 8pm train found.');
        }
      } else {
        console.log('Trip not found.');
      }
    } else {
      console.log('Server currently down.');
    }
  });
}
