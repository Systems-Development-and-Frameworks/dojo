const { nuxifyStorybook } = require('../.nuxt-storybook/storybook/main.js')

module.exports = nuxifyStorybook({
  stories: [
    '../pages/*.stories.js'
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
  ]
})
