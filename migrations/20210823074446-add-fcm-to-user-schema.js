module.exports = {
  async up(db, client) {
    await db.collection('users').updateMany({}, {$set: {fcmToken: null}});
  },

  async down(db, client) {
    await db.collection('users').updateMany({}, {$unset: {fcmToken: null}});
  }
};
