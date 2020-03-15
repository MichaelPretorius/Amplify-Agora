var express = require('express');
var bodyParser = require('body-parser');
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
require('dotenv').config();
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var AWS = require('aws-sdk');

const config = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID_1,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_1,
	reqion: 'eu-west-1',
	adminEmail: 'michaelpretorius96@gmail.com',
};

var ses = new AWS.SES(config);
// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

/****************************
* post method *
****************************/

const chargeHandler = async (req, res, next) => {
	// const { token } = req.body;
	const {currency, amount, description} = req.body.charge;
	const { email } = req.body;

	try {
		const charge = await stripe.paymentIntents.create({
			// source: token.id,
			amount,
			currency,
			description,
			payment_method_types: ['card'],
			receipt_email: email.customerEmail,
		});
    // res.json(charge);
    // if (charge.status === 'succeeded') {
		// 	next();
		// }
    if (charge.object === 'payment_intent') {
      req.charge = charge;
      req.description = description;
      req.email = email;
			next();
		}
	} catch (error) {
		res.status(500).json({error});
	}
};

const converCentsToDollars = price => (price / 100).toFixed(2);

const emailHandler = (req, res) => {
  const { charge, description, email: { shipped, customerEmail, ownerEmail } } = req;

  ses.sendEmail(
		{
			Source: config.adminEmail,
			ReturnPath: config.adminEmail,
			Destination: {
				ToAddresses: [config.adminEmail],
			},
			Message: {
				Subject: {
					Data: 'Order Details - AmplifyAgora',
				},
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: `
            <h3>Order Processed!</h3>
            <p><span style="font-weight: bold;">${description}</span> - $${converCentsToDollars(
							charge.amount,
						)}</p>
            
            <p>Customer Email: <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p>Contact your seller: <a href="mailto:${ownerEmail}">${ownerEmail}</a></p>

            <h4>Delivery method:</h4>
            <p>${shipped ? 'Shipped' : 'Emailed'}</p>

            <p style="font-style: italic; color: grey;">
              ${shipped ? 'Your product will be shipped in 2-3 days' :
              'Check your verified email for your emailed product'}
            </p>
            `,
					},
				},
			},
		},
		(err, data) => {
			if (err) {
				res.json({error: err});
			}
			res.json({
				message: 'Order processed successfully!',
				charge,
				data,
			});
		},
	);
};

app.post('/charge', chargeHandler, emailHandler);

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
