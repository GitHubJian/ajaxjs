var { fetch } = require('./fetch.js')

window.fetch || (window.fetch = fetch)
