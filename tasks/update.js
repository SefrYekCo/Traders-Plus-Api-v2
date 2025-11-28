const User = require('../models/schemas/user')
const Channel = require('../models/schemas/channel')
const firebaseService = require('../services/firebase.service')
const { notifType, PlanType } = require('../configs/secret')
const { getEnv } = require('../helpers/envHelper')

const sendNotifications = async (room, message) => {
    const enabled = await getEnv('ENABLE_NOTIFICATIONS')
    console.log('enabling notif: ',enabled);
    if(enabled === 'false') {
        return
    }
    var channel = await Channel.findOne({_id: room._id}).populate('plan', '_id name type')
    if(channel.muted || channel._id === process.env.NEWS_CHANNEL_ID) {
        console.log('this channel is muted by admin or this is news channel');
        return
    }
    var users = await User.find({
        "notifications": true,
        "fcm.expireDate": {
            $gte: Date.now()
        },
    })

    users = users.filter(o => o.fcm && o.fcm.token && (o.fcm.expireDate > Date.now()))

    console.log( "TYPE :" ,channel.plan.type !== PlanType.public ,channel.plan.type );

    if(channel.plan.type !== PlanType.public) {
        var temp = []
        for(const i in users) {
            let userHavePlan = users[i].plans.findIndex(o => String(o.planId) === String(channel.plan._id) && o.expireDate > Date.now())
            if((userHavePlan !== -1) && !users[i].mutedChannels.includes(channel._id))
                temp.push(users[i])
        }
        
        users = temp
    } else {
        var temp = []
        for(const i in users) {
            if(!users[i].mutedChannels.includes(channel._id))
                temp.push(users[i])
        }
        users = temp
    }
   
    console.log('users count: ', users.length, users.map( o => o.mobileNumber));

    let fcms = []
    for(const i in users){
        fcms.push(users[i].fcm.token)
    }


    const chunkSize = 499;
    for (let i = 0; i < fcms.length; i += chunkSize) {
        const chunk = fcms.slice(i, i + chunkSize);
        const messageBody = {
            data: handleFcmDataObject(channel, message),
            tokens: chunk
        }
        const response = await firebaseService.sendMulticast(messageBody)
        console.log(`firebase response : ${response}`);
        console.log(`${response.successCount} firebase notification sent successfully`);
    }


    // for (const i in users) {
    //     var data = handleFcmDataObject(channel, message)
    //     var response = await firebaseService.sendMessage(users[i].fcm.token, data)
    //     if (response.successCount > 0) {
    //         console.log(`notification sent to user ${users[i].mobileNumber}`);
    //         console.log("Successfully sent notification");
    //     }
    // }
}

const handleFcmDataObject = (channel, message) => {
    let fcmObject = { notificationType: `${notifType.chatroomMessage}` };
    
    return {
        ...fcmObject,
        title: channel.name,
        message: message.title,
        image: (message.file) ? message.file : '',
        destination: `fragment=channelFragment&channelId=${String(channel._id)}`,
        action: 'internalDestination',
    }
}

module.exports = {
    sendNotifications,
}