const functions = require('firebase-functions')
const fetch = require('node-fetch')

const API_BASE = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_API_KEY || functions.config().football?.api_key || ''

exports.footballProxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  try {
    // Strip the /api/football prefix to get the actual path
    const path = req.path.replace(/^\/api\/football/, '') || '/'
    const url = `${API_BASE}${path}`

    const response = await fetch(url, {
      headers: { 'X-Auth-Token': API_KEY },
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message })
  }
})
