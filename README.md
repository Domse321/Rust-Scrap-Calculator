# Rust Scrap Calculator

Ein schlanker Rechner für Rust-Recycling: Inventar eintragen oder Screenshot analysieren und direkt sehen, wie viel Scrap, Metal Fragments, HQM und Cloth bei normalen bzw. Safezone-Recyclern herauskommt.

## Funktionen

- Rust-Komponenten manuell erfassen
- erwartete Ausbeute für normale Recycler und Safezone-Recycler vergleichen
- Recycling-Zeit grob abschätzen
- optionale Screenshot-Analyse über einen eigenen API-Key
- API-Key wird bei manueller Eingabe nur lokal im Browser gespeichert


## Live-Version

Eine aktuelle Version des Repos läuft unter:

```text
https://rustscrap.netlify.app
```

## Lokale Entwicklung

**Voraussetzungen:** Node.js 18+

```bash
npm install
cp .env.example .env.local
npm run dev
```

Die App läuft standardmäßig unter:

```text
http://localhost:3000
```

## API-Key / Secrets

Für die Screenshot-Analyse wird ein kompatibler API-Key benötigt.

1. `.env.example` nach `.env.local` kopieren.
2. In `.env.local` den Key eintragen.
3. `.env.local` bleibt lokal und wird nicht committed.

```env
GEMINI_API_KEY="..."
VITE_GEMINI_API_KEY="..."
```

Hinweis: Alles mit `VITE_` wird bei einem rein statischen Vite-Build in den Browser-Bundle eingebettet. Für öffentliche Deployments ist deshalb die sicherere Variante, den Key nicht mitzubuilden und Nutzer den Key lokal im Einstellungsdialog eintragen zu lassen — oder später einen kleinen Backend-Proxy zu verwenden.

## Scripts

```bash
npm run dev      # Entwicklungsserver
npm run build    # Produktionsbuild
npm run preview  # lokalen Build ansehen
npm run lint     # TypeScript-Check
npm run clean    # dist entfernen
```

## Projektstruktur

```text
src/
  App.tsx          # UI und Screenshot-Analyse
  data/items.ts    # Rust-Items und Recycling-Werte
  main.tsx         # React-Einstiegspunkt
```

## Deployment

Für statisches Hosting reicht:

```bash
npm run build
```

Der fertige Build liegt danach in `dist/`.
