require('dotenv').config();

const base = require('./app.json');

module.exports = {
  expo: {
    ...base.expo,
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '03d2da9d-b28d-44ea-91ae-4250c66217e6',
      },
    },
  },
};
