module.exports = {
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [/^(?!\/api\/)/],
  root: 'build',
  staticFileGlobs: ['build/**/*.js', 'build/**/*.css', 'build/index.html'],
};
