const mix = require('laravel-mix')

// NOTE: Don't remove this, Because it's the default public folder path on AdonisJS
mix.setPublicPath('public')

// Add your assets here
mix
    .js('resources/assets/scripts/app.js', 'scripts')
    .sass('resources/assets/styles/app.scss', 'styles')