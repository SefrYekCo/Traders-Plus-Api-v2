module.exports = {
  async up(db, client) {
    await db.collection('alerts').updateMany({}, { $set: { isCrypto: false } });
  },

  async down(db, client) {
    await db.collection('alerts').updateMany({}, { $unset: { isCrypto: null } });
  }
};

