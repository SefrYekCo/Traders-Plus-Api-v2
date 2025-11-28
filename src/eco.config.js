module.exports = {
  apps: [
    {
      name: "api",
      script: "src/server.js",
      instances: "max", // automatically use all CPUs
      exec_mode: "cluster", // enable PM2 cluster mode
      watch: false,
      ignore_watch: ["node_modules", "public"],
      env_local: {
        NODE_ENV: "development",
        PAYMENT_URL: "http://api:5000",
        NEWS_ADMIN_USER_ID: "60f572848fb7f25905ef3c1a",
        BOURSE_RSS_CHANNEL_ID: "",
        CAR_AND_HOUSING_RSS_CHANNEL_ID: "",
        NEWS_CHANNEL_ID: "",
        T_START_ID: 1600,
      },
      env_production: {
        NODE_ENV: "production",
        PAYMENT_URL: "https://api.traderzplus.ir",
        NEWS_ADMIN_USER_ID: "60f6c4ab0609846960a2a60c",
        BOURSE_RSS_CHANNEL_ID: "63a6a3a08a66d14a377d2626",
        CAR_AND_HOUSING_RSS_CHANNEL_ID: "63a6a4b2ffc8374a54f1033a",
        LASTNEWS_RSS_CHANNEL_ID: "63a6a3d9d441584a196d0c96",
        MOSTVIEWS_RSS_CHANNEL_ID: "63a6a4edec165b4a23d6d3a8",
        CURRENCIES_RSS_CHANNEL_ID: "63a6a482ea86004a3043140c",
        NEWS_CHANNEL_ID: "60f7d000754eec33d2e3d0cd",
        T_START_ID: 100000,
      },
      env_test: {
        NODE_ENV: "test",
        PAYMENT_URL: "http://tradersplus-qa.sefryek.com:5000",
        NEWS_ADMIN_USER_ID: "60f572848fb7f25905ef3c1a",
        BOURSE_RSS_CHANNEL_ID: "63a02fcae2e1f2050ef7bfb0",
        CAR_AND_HOUSING_RSS_CHANNEL_ID: "63a05fc528f38e07d3baca50",
        LASTNEWS_RSS_CHANNEL_ID: "63a05ee3f2e2e707be711778",
        MOSTVIEWS_RSS_CHANNEL_ID: "63a05f8e057e7a07df62fa18",
        CURRENCIES_RSS_CHANNEL_ID: "63a05f489a5fc207cbbbebba",
        NEWS_CHANNEL_ID: "612a2cb7446b096a3bc43801",
        JWT_SECRET_FORGET_PASS: "j!4P&mLKNXqxFC@w",
        T_START_ID: 1600,
      },
    },
  ],
};
