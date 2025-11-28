module.exports = {
  async up(db, client) {
    await db.collection('banners').updateMany({}, { $set: { widthScale: 1 } });
  },

  async down(db, client) {
    await db.collection('banners').updateMany({}, { $unset: { widthScale: null } });
  }
};

