const serviceAccount = require("../public/resources/firebase.json");
const admin = require("firebase-admin")
const User = require('../models/schemas/user')
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://m-trader-pro-d1b65-default-rtdb.firebaseio.com",
  });
} catch (error) {
  console.log(error);
} finally {
  console.log("firebase successfully connected!");
}

var options = {
  priority: "high",
  contentAvailable: true
}

exports.sendMessage = async (fcmToken, data) => {
  try {
    let response = await admin.messaging().sendToDevice(fcmToken, { data }, options);
    if (response.failureCount > 0) {
      //console.log(response.results[0].error);
      console.log('Error in send notification');
      //let user = await User.findOne({ "fcm.token" : fcmToken})
      //user.fcm.token = null
      //user.save()
    }
    return response
  } catch (error) {
    console.log(error)
  }
}

exports.sendMulticast = async (message) => {
  try {
    let response = await admin.messaging().sendMulticast(message)
    // if (response.failureCount > 0) {
    //   console.log('Error in send notification');
    // }
    //console.log(response);
    return response
  } catch (error) {
    console.log(error)
  }
}


var payload = {
  data: {
    title: "Welcome to My Group",
    message: "You may have new messages"
  }
};

// admin.messaging().sendToDevice(elnaztoken, payload, options)
//   .then(function (response) {
//     console.log("Successfully sent message:", response);
//     console.log(response.results[0].error);
//   }).catch(function (error) {
//     console.log("Error sending message ", error.error);
//   })