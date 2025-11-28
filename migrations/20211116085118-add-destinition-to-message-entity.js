module.exports = {
  async up(db, client) {
    await db.collection('messages').updateMany({}, { $set: { destination: '', action: '' } });
  },

  async down(db, client) {
    await db.collection('messages').updateMany({}, { $unset: { destination: null, action: null } });
  }
};
