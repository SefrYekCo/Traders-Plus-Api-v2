module.exports = {
  async up(db, client) {
    await db.collection('users').updateMany({}, { $unset: { fcmToken: "" } });
    await db.collection('users').updateMany({}, { $set: { fcm: null } });
  },

  async down(db, client) {
    await db.collection('users').updateMany({}, { $set: { fcmToken: null } });
    await db.collection('users').updateMany({}, { $unset: { fcm: null } });
  }
};
