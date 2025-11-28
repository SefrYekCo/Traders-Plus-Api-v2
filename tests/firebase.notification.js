const firebaseService = require('../services/firebase.service')
//const { notifType } = require('../configs/secret')
var registerToken = "c_N5WylKSWao_lwBM23jbj:APA91bGcENtDyhf8y79lArSYnnuRVhUgMdoFOcVEP-9gBm7E3GK7jn39d9D5myTMFGh1xbKV6wO6vNUMebw5QXGZ9-P-eraM7qvxCq5pZfR-Od3KIocOIj3DLp3LgkN9A3fBxMZeD92j"

const handleFcmDataObject = () => {
    let fcmObject = { notificationType: '2' };
    let expirePlansTitles = ['پلن پرو']
    let days = 29
    return {
        ...fcmObject,
        title: 'تایتل تست',
        message: `این یک پیغام تست برای نوتیف است`,
        image: '',
        destination: 'fragment=channelFragment&channelId=60f54f93a51ae058ed298b17',
        action: 'internalDestination',
    }
}

var send = async () => {
    var data = handleFcmDataObject()
    console.log(data);
    var response = await firebaseService.sendMessage(registerToken, data)
    console.log(response.results);
}
send()


