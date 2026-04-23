# Ophaalsessie AI Automatisering

Tool voor het verzamelen van laaghangend fruit voor AI-automatisering. Medewerkers vullen per idee in welk proces tijd kost, hoe frequent, en hoeveel besparing er mogelijk is. Prioritering gebeurt automatisch.

## Features

- Formulier met klikbare tags voor snel invullen
- Automatische prioritering op basis van frequentie, repetitiviteit en tijdsbesparing
- Live statistieken (totaal, hoge prioriteit, besparing/week)
- Filter per team en prioriteit
- Export naar CSV en Claude-prompt
- Backend API voor centrale data-opslag (Node.js)

## Deploy

### Statische versie (zonder backend)
Open `index.html` direct in een browser. Data wordt lokaal in de browser gehouden.

### Met backend
```bash
docker build -t ophaal-api .
docker run -d -p 3210:3210 -v ./data:/app/data --restart unless-stopped ophaal-api
```

## Stack
- Frontend: vanilla HTML/CSS/JS
- Backend: Node.js (zero dependencies)
- Hosting: nginx reverse proxy
