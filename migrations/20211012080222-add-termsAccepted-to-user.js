module.exports = {
  async up(db, client) {
    await db.collection('users').updateMany({}, {$set: {termsAccepted: false}});
  },

  async down(db, client) {
    await db.collection('users').updateMany({}, {$unset: {termsAccepted: null}});
  }
};
