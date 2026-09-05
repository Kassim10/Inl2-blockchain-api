# Blockchain API för verifiering av lyxprodukter

Ett Node.js-baserat REST API som använder en blockkedja och Proof-of-Work för att registrera och verifiera ägarbyten av lyxprodukter.

Projektet är utvecklat som en del av kursen Node.js och blockkedjeutveckling.

## Syfte

Förfalskningar är ett problem på marknaden för exempelvis klockor, väskor, sneakers och konst. Syftet med detta projekt är att visa hur blockkedjeteknik kan användas för att skapa ett digitalt produktpass där produktens ägarhistorik kan verifieras.

Varje ägarbyte registreras som en transaktion. Transaktionerna samlas i block som säkras med SHA-256 och Proof-of-Work.

När ett block har mine:ats och lagts till i kedjan kan förändringar av blockets data upptäckas genom validering av blockkedjan.

## Tekniker

Projektet använder bland annat:

- Node.js
- Express
- JavaScript med ES-moduler
- Node.js `crypto`
- SHA-256
- Proof-of-Work
- REST API
- dotenv
- Vitest
- Supertest

## Funktionalitet

API:t stödjer:

- registrering av ägarbyten
- validering av nuvarande ägare
- pending transactions
- Proof-of-Work mining
- verifiering av blockkedjans integritet
- historik för en specifik produkt
- konfigurerbar mining difficulty
- centraliserad felhantering
- deterministisk JSON-serialisering

## Projektstruktur

```text
src/
├── controllers/
│   └── transactionController.js
│
├── engine/
│   ├── Block.js
│   └── Blockchain.js
│
├── middleware/
│   ├── errorHandler.js
│   └── notFound.js
│
├── routes/
│   ├── chainRoutes.js
│   ├── transactionRoutes.js
│   └── verifyRoutes.js
│
├── utils/
│   └── stableStringify.js
│
├── app.js
├── blockchain.js
└── server.js

tests/
├── api.test.js
├── block.test.js
└── blockchain.test.js
```

Projektet är uppdelat i flera lager för att separera olika ansvarsområden.

`engine` innehåller själva blockkedjelogiken och Proof-of-Work.

`controllers` hanterar logiken mellan HTTP-anrop och blockkedjan.

`routes` definierar API-endpoints.

`middleware` hanterar bland annat fel och okända routes.

`utils` innehåller hjälpfunktioner som används för deterministisk serialisering.

## Installation

Klona projektet och installera dependencies:

```bash
npm install
```

Skapa därefter en `.env`-fil i projektets rot.

Exempel:

```env
PORT=3000
POW_DIFFICULTY=1
```

En mall finns även i `.env.example`.

Starta utvecklingsservern med:

```bash
npm run dev
```

Servern körs som standard på port `3000`.

## API

### Hämta blockkedjan

```http
GET /api/chain
```

Returnerar hela blockkedjan, pending transactions och resultatet av kedjans integritetskontroll.

Exempel:

```json
{
  "chain": [],
  "pendingTransactions": [],
  "valid": true
}
```

---

### Skapa en transaktion

```http
POST /api/transactions
```

Exempel på request body:

```json
{
  "serialNumber": "ROLEX-SUB-9981",
  "fromAddress": "ROLEX",
  "toAddress": "KASSIM",
  "timestamp": 1772188800000
}
```

Transaktionen valideras innan den läggs till i `pendingTransactions`.

Om produkten redan har en registrerad ägare måste `fromAddress` motsvara produktens nuvarande ägare.

Exempel:

```text
ROLEX -> KASSIM
KASSIM -> ALI
```

är giltigt.

Däremot:

```text
ROLEX -> KASSIM
ALI -> JOHN
```

nekas eftersom `ALI` inte är produktens nuvarande ägare.

---

### Mine:a pending transactions

```http
POST /api/mine
```

Endpointen skapar ett nytt block av väntande transaktioner och kör Proof-of-Work innan blocket läggs till i kedjan.

Efter lyckad mining töms `pendingTransactions`.

---

### Verifiera en produkt

```http
GET /api/verify/:id
```

Exempel:

```http
GET /api/verify/ROLEX-SUB-9981
```

Returnerar produktens fullständiga registrerade historik och nuvarande ägare.

Exempel:

```json
{
  "serialNumber": "ROLEX-SUB-9981",
  "currentOwner": "ALI",
  "history": [
    {
      "serialNumber": "ROLEX-SUB-9981",
      "fromAddress": "ROLEX",
      "toAddress": "KASSIM",
      "timestamp": 1772188800000
    },
    {
      "serialNumber": "ROLEX-SUB-9981",
      "fromAddress": "KASSIM",
      "toAddress": "ALI",
      "timestamp": 1772188900000
    }
  ]
}
```

## Proof-of-Work

Varje block innehåller bland annat:

- index
- timestamp
- transaktioner
- previousHash
- nonce
- hash

Hashen genereras med SHA-256 genom Node.js inbyggda `crypto`-modul.

Vid mining ökas blockets `nonce` tills blockets hash börjar med det antal nollor som anges av `difficulty`.

Exempel med difficulty `2`:

```text
00f7c9...
```

Mining difficulty konfigureras genom:

```env
POW_DIFFICULTY=1
```

En låg difficulty rekommenderas under utveckling och testning.

## State validation

Systemet kontrollerar produktens tidigare transaktioner innan ett nytt ägarbyte accepteras.

Om exempelvis:

```text
ROLEX -> KASSIM
```

har registrerats är `KASSIM` produktens nuvarande ägare.

En transaktion:

```text
ALI -> JOHN
```

för samma produkt kommer därför att nekas.

Detta förhindrar att någon som inte är registrerad ägare kan överföra produkten.

Valideringen sker innan transaktionen läggs till i pending-poolen och innan den kan mine:as in i blockkedjan.

## Kedjans integritet

Metoden `isChainValid()` kontrollerar blockkedjans integritet.

För varje block verifieras bland annat:

1. att den lagrade hashen fortfarande motsvarar blockets innehåll
2. att `previousHash` pekar på föregående blocks hash

Om data i ett redan mine:at block ändras kommer den beräknade hashen inte längre överensstämma med den lagrade hashen och kedjan markeras som ogiltig.

## Deterministisk serialisering

Innan blockets data hash:as används en egen `stableStringify()`-funktion.

Objektnycklar sorteras innan serialisering för att samma data ska ge samma representation även om objektets nycklar skapades i olika ordning.

Exempel:

```js
{
  serialNumber: "ROLEX-1",
  fromAddress: "ROLEX",
  toAddress: "KASSIM"
}
```

och:

```js
{
  toAddress: "KASSIM",
  serialNumber: "ROLEX-1",
  fromAddress: "ROLEX"
}
```

representerar samma information och ger därför samma hash när övriga blockegenskaper är identiska.

## Felhantering

API:t använder centraliserad Express error-handling middleware.

Exempel på HTTP-statuskoder:

- `400 Bad Request` – ofullständig transaktion eller mining utan pending transactions
- `404 Not Found` – produkt eller route hittades inte
- `422 Unprocessable Entity` – ogiltigt ägarbyte
- `500 Internal Server Error` – oväntat serverfel

Exempel på felsvar:

```json
{
  "error": {
    "message": "Invalid ownership transfer. Current owner is KASSIM",
    "status": 422
  }
}
```

## Tester

Projektet använder Vitest och Supertest.

Kör alla tester med:

```bash
npm test
```

Testerna täcker bland annat:

- skapande av block
- SHA-256 hashing
- Proof-of-Work
- nonce-förändringar
- genesis block
- pending transactions
- mining
- state validation
- giltiga och ogiltiga ägarbyten
- produktens historik
- kedjevalidering
- manipulation av mine:ade block
- deterministisk serialisering
- API-routes
- HTTP-statuskoder
- felhantering

## Exempel på användningsflöde

Ett normalt flöde kan se ut så här:

```text
1. POST /api/transactions
   ROLEX -> KASSIM

2. POST /api/mine

3. POST /api/transactions
   KASSIM -> ALI

4. POST /api/mine

5. GET /api/verify/ROLEX-SUB-9981

   currentOwner: ALI
```

Om någon därefter försöker:

```text
KASSIM -> JOHN
```

kommer transaktionen att nekas eftersom `KASSIM` inte längre är produktens registrerade ägare.

## Säkerhet och begränsningar

Det här projektet är en förenklad implementation skapad för att demonstrera blockkedjekoncept.

I ett produktionssystem skulle ytterligare funktionalitet behövas, exempelvis:

- digitala signaturer för ägarbyten
- autentisering och auktorisering
- persistent datalagring
- distribuerade noder
- nätverkskonsensus
- säkrare identitetshantering

Projektets blockkedja lagras i minnet och återställs när servern startas om.