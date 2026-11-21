# Gym your Life

Trainings-Tagebuch für Josi: Übungen, Sätze und Wiederholungen – die App merkt sich alle Werte für das nächste Training.

- Reine Web-App ohne Server: alle Daten bleiben auf dem Handy (Browser-Speicher).
- Funktioniert offline und lässt sich auf den Startbildschirm legen.
- Veröffentlicht über Cloudflare Pages (kein Build-Schritt, Ausgabeordner = Hauptordner).

## Dateien
- `index.html` – Startdatei
- `styles.css` – Aussehen (Styleguide: Nachtblau, Türkis, Barlow Condensed + Inter)
- `data.js` – Übungen, Muskeln, Sprüche, Essens-Ideen, Vorlagen
- `js/` – die einzelnen Seiten (Start, Pläne, Training, Verlauf, Fortschritt, Routinen, Essen, Schwimmen, Einstellungen)
- `sw.js` – Offline-Speicher · `manifest.webmanifest` – App-Name und Symbole · `icons/` – Logo und App-Symbole

## Aktualisieren
Geänderte Dateien in GitHub hochladen → Cloudflare veröffentlicht automatisch neu.
Bei größeren Änderungen in `sw.js` die Zahl in `gyl-v1` erhöhen (z. B. `gyl-v2`), damit alle Handys die neue Version laden.
