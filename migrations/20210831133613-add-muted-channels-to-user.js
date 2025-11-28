module.exports = {
  async up(db, client) {
    await db.collection('users').updateMany({}, { $set: { mutedChannels: [] } });
  },

  async down(db, client) {
    await db.collection('users').updateMany({}, { $unset: { mutedChannels: [] } });
  }
};
