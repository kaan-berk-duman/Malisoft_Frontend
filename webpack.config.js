const path = require('path');

module.exports = {
  entry: './src/index.js', // Projenizin giriş dosyasını burada belirtin.
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Çıkış dizini
  },
  resolve: {
    fallback: {
      timers: require.resolve('timers-browserify'),
    },
  },
};
