const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3210;
const DATA_FILE = path.join(__dirname, 'data', 'ideeen.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return []; }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/ideeen') {
    let data = readData();
    const team = url.searchParams.get('team');
    const priority = url.searchParams.get('priority');
    if (team) data = data.filter(i => i.team === team);
    if (priority) data = data.filter(i => i.priority === priority);
    data.sort((a, b) => b.score - a.score);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
  else if (req.method === 'POST' && url.pathname === '/api/ideeen') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const idee = JSON.parse(body);
        idee.id = Date.now();
        idee.timestamp = new Date().toISOString();
        const data = readData();
        data.push(idee);
        writeData(data);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(idee));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  else if (req.method === 'DELETE' && url.pathname.startsWith('/api/ideeen/')) {
    const id = parseInt(url.pathname.split('/').pop());
    let data = readData();
    data = data.filter(i => i.id !== id);
    writeData(data);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  }
  else if (req.method === 'GET' && url.pathname === '/api/ideeen/export/csv') {
    const data = readData().sort((a, b) => b.score - a.score);
    const headers = ['Prioriteit', 'Score', 'Team', 'Naam', 'Proces', 'Frequentie', 'Aard', 'Tijdsbesparing', 'Repetitief', 'Context', 'Tijdstip'];
    const rows = data.map(i =>
      [i.priority, i.score, i.team, i.naam, i.proces, i.freq, (i.aard || []).join('; '), i.tijdMin + ' min', i.repetitief, (i.context || '').replace(/"/g, '""'), i.timestamp].map(v => `"${v}"`).join(';')
    );
    const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=ai-automatisering.csv' });
    res.end(csv);
  }
  else if (req.method === 'GET' && url.pathname === '/api/stats') {
    const data = readData();
    const totalMin = data.reduce((sum, i) => {
      const m = { 'Dagelijks': 5, 'Wekelijks': 1, 'Maandelijks': 0.25, 'Per kwartaal': 0.08, 'Ad hoc': 0.5 };
      return sum + (i.tijdMin || 0) * (m[i.freq] || 1);
    }, 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total: data.length,
      hoog: data.filter(i => i.priority === 'hoog').length,
      midden: data.filter(i => i.priority === 'midden').length,
      laag: data.filter(i => i.priority === 'laag').length,
      savingsPerWeek: Math.round(totalMin / 60) + 'u'
    }));
  }
  else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`Ophaal API draait op poort ${PORT}`));
