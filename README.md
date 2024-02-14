## Environment Requirements:

Node.js 18.17 or later

## How to run:

Run local:

```bash
echo NEXT_PUBLIC_SOCKET_URL=localhost > .env.local
npm install
npm run dev
```

Run dev:

```bash
echo NEXT_PUBLIC_SOCKET_URL={host} > .env.development
npm install
npm run dev
```

Run prod:

```bash
echo NEXT_PUBLIC_SOCKET_URL={host} > .env.production
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the page.
