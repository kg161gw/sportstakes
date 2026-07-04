const functions = require('firebase-functions')
const fetch = require('node-fetch')

// ── football-data.org proxy ────────────────────────────────────────────
const FD_BASE = 'https://api.football-data.org/v4'
const FD_KEY = process.env.FOOTBALL_API_KEY || ''

exports.footballProxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  try {
    const path = req.path.replace(/^\/api\/football/, '') || '/'
    const query = Object.keys(req.query).length
      ? '?' + new URLSearchParams(req.query).toString()
      : ''
    const url = `${FD_BASE}${path}${query}`

    const response = await fetch(url, {
      headers: { 'X-Auth-Token': FD_KEY },
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message })
  }
})

// ── API-Football (api-sports.io) proxy ────────────────────────────────
const AF_BASE = 'https://v3.football.api-sports.io'
const AF_KEY = process.env.API_FOOTBALL_KEY || ''

exports.apiFootballProxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (!AF_KEY) {
    res.status(500).json({ error: 'API_FOOTBALL_KEY not configured' })
    return
  }

  try {
    const path = req.path.replace(/^\/api\/apifootball/, '') || '/'
    const query = Object.keys(req.query).length
      ? '?' + new URLSearchParams(req.query).toString()
      : ''
    const url = `${AF_BASE}${path}${query}`

    const response = await fetch(url, {
      headers: { 'x-apisports-key': AF_KEY },
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'API-Football proxy error', detail: err.message })
  }
})
