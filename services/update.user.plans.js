const User = require('../models/schemas/user')
const Plan = require('../models/schemas/plan')
const firebaseService = require('../services/firebase.service')
const { getEnv } = require('../helpers/envHelper')
var days = 4
var minimumDaysLater = 3 * 24 * 60 * 60 * 1000; // as millisecond : days * hours * min * 60s * 1000ms
var maximumDaysLater = 4 * 24 * 60 * 60 * 1000; // as millisecond : days * hours * min * 60s * 1000ms
const { notifType } = require('../configs/secret')

exports.removeExpirePlans = async () => {
    const users = await User.find({ "plans": { $elemMatch: { "$exists": true } } })
    for (const i in users) {
        let userPlans = users[i].plans
        for (const j in userPlans) {
            if (userPlans[j].expireDate < Date.now()) {
                removePlanOfUser(users[i])
            }
        }
    }
}

exports.plansExpireSoon = async () => {
    try {
        var plans = await Plan.find({ isActive: true })
        var users = await getUsersTheirPlansExpireSoon()
        console.log('users count(can be extend plans):', users.length);
        for (const i in users) {
            var data = handleFcmDataObject(users[i], plans)
            var response = await firebaseService.sendMessage(users[i].fcm.token, data)
            if (response.successCount > 0) {
                console.log("Successfully sent notification => ", users[i].mobileNumber);
            }
        }

    } catch (error) {
        console.log(error)
    }
}

const getUsersTheirPlansExpireSoon = async () => {
    try {
        days = await getEnv('DAYS_FOR_SEND_NOTIFICATIONS_BEFORE_EXPIRE')
        minimumDaysLater = (parseInt(days) - 1) * 24 * 60 * 60 * 1000;
        maximumDaysLater = parseInt(days) * 24 * 60 * 60 * 1000;
        var users = await User.find({ "plans": { $elemMatch: { "$exists": true } } })
        users = users.filter(o => o.fcm && o.fcm.token && (o.fcm.expireDate > Date.now()))
        var filterUsers = []
        for (const i in users) {
            let user = users[i]
            for (const j in user.plans) {
                if ((user.plans[j].expireDate.getTime() > Date.now() + minimumDaysLater) &&
                    (user.plans[j].expireDate.getTime() < Date.now() + maximumDaysLater)) {
                    filterUsers.push(user)
                    break
                }
            }
        }
        return filterUsers
    } catch (error) {
        console.log(error);
        return []
    }
}

const handleFcmDataObject = (user, plans) => {
    let fcmObject = { notificationType: `${notifType.planExpirationAlert}` };
    var expirePlansTitles = []
    for (const j in user.plans) {
        if ((user.plans[j].expireDate.getTime() > Date.now() + minimumDaysLater) &&
            (user.plans[j].expireDate.getTime() < Date.now() + maximumDaysLater)) {
            let index = plans.findIndex(x => String(x._id) === String(user.plans[j].planId));
            expirePlansTitles.push(plans[index].name)
        }
    }

    return {
        ...fcmObject,
        title: 'منقضی شدن اشتراک',
        message: `کمتر از ${days} روز تا منقضی شدن اشتراک(های) ${expirePlansTitles.join("، ")} شما باقی مانده است، پس از اتمام میتوانید از صفحه خرید اشتراک نسبت به تمدید اشتراک خود اقدام فرمايید.`,
        image: '',
        destination: `fragment=subscriptionBaseFragment`,
        action: 'internalDestination',
    }
}

const removePlanOfUser = async (user) => {
    try {
        user.plans = user.plans.filter(e => e.expireDate >= Date.now())
        user.save()
    } catch (error) {
        console.log(error)
    }
}