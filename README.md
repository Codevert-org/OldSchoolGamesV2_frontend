# OldSchoolGames V2 - Frontend

<div align="center">

**Interface web retro/arcade pour jouer aux jeux classiques en ligne**

Built with **React 19** • **TypeScript** • **Vite** • **Socket.IO**

</div>

---

## 📋 À propos

OldSchoolGames V2 Frontend est une SPA avec thème rétro arcade qui se connecte au backend en temps réel via WebSocket pour synchroniser les parties entre joueurs.

### Fonctionnalités principales

- ✅ **Interface rétro arcade** - Thème vert CRT, police Sixtyfour, fond noir
- ✅ **Authentification JWT** - Gestion des tokens et sessions utilisateur
- ✅ **Profils personnalisés** - Upload d'avatars avec cropping interactif
- ✅ **Système d'invitations** - Inviter d'autres joueurs en temps réel
- ✅ **Communication temps réel** - WebSocket (Socket.IO) pour synchronisation live
- ✅ **Notifications live** - Connexions, déconnexions, inscriptions (NotificationFeed)
- ✅ **Jeu Morpion** - Grille 3×3 interactive, multiplayer
- ✅ **Jeu Puissance4** - Grille 7×6 interactive, multiplayer
- ✅ **Jeu Reversi** - Grille 8×8, animation flip SVG des pions retournés

---

## 🛠 Stack Technologique

| Catégorie | Technologies |
|-----------|--------------|
| **Framework** | React 19, TypeScript |
| **Build Tool** | Vite 7 |
| **Temps réel** | Socket.IO Client 4 |
| **Routing** | React Router DOM 7 |
| **UI Components** | Material-UI 7 (menus dropdown uniquement) |
| **Styling** | CSS + SCSS |
| **Image Cropping** | React Easy Crop |
| **State Management** | React Context API |

---

## 📁 Architecture du projet

```
src/
├── components/              # Composants réutilisables
│   ├── Box/
│   ├── Button/
│   ├── CropperModal/        # Modal de cropping avatar
│   ├── FormLine/
│   ├── Header/
│   ├── LoginForm/           # Login + Register (même composant, switch)
│   ├── NotificationFeed/    # Bandeau connexions/déconnexions/inscriptions
│   ├── Switch/
│   ├── UserItem/            # Carte joueur + menu invitation
│   ├── UserList/
│   ├── ProtectedContent.tsx # Guard → redirect /login si pas de token
│   └── index.ts
│
├── contexts/
│   ├── appContext.ts        # {accessToken, user} + setter
│   └── wsContext.ts        # {socket: SocketIO, ioClose: fn}
│
├── providers/
│   ├── AppProvider.tsx      # Charge user depuis localStorage au montage
│   └── WsProvider.tsx       # Initialise Socket.IO avec token
│
├── pages/
│   ├── Dashboard/           # Liste joueurs, invitations, NotificationFeed, stats de parties (onglets Global/Morpion/Puissance4/Reversi, filtre semaine/mois/année)
│   ├── Game/
│   │   ├── GameBoard.tsx    # Grille générique (cols, rows, cellsContent, handleCellClick)
│   │   ├── Morpion/
│   │   ├── Puissance4/
│   │   └── Reversi/         # Animation flip SVG (ellipse)
│   ├── Home/                # Layout avec Header
│   ├── Login/
│   └── Profile/             # Édition profil, avatar, mot de passe
│
├── services/                # Couche fetch
│   ├── auth.service.ts
│   ├── users.service.ts
│   └── checkResponse.ts
│
├── interfaces/              # Types TypeScript (préfixe I)
│   ├── events/
│   │   ├── IUsers.ts        # IUserEventData: connected | disconnected | registered
│   │   ├── IGameEventData.ts # cells?, flippedCells?, pass?, error?
│   │   └── IWsProvider.ts
│   ├── IauthResponse.ts     # avatarMessage?: string
│   └── IUserResponse.ts
│
└── utils/
    ├── canvasUtils.tsx      # Logique cropping image
    └── constants/
        └── extensions.ts    # Mapping MIME types
```

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js 18+
- Backend OldSchoolGames en cours d'exécution sur `http://localhost:3000`

### Installation

```bash
cd OldSchoolGames/V2/frontend
npm install
cp .env.example .env
```

### Variables d'environnement

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Démarrage

```bash
npm run dev        # Développement (hot reload)
npm run build      # Build production
npm run preview    # Preview du build
```

### Code Quality

```bash
npm run lint
npm run lint:fix
```

---

## 📱 Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/login` | Connexion / Inscription | ❌ |
| `/` | Layout Header (parent) | ✅ |
| `/dashboard` | Liste joueurs, invitations | ✅ |
| `/profile` | Profil utilisateur | ✅ |
| `/morpion` | Jeu Morpion | ✅ |
| `/puissance4` | Jeu Puissance4 | ✅ |
| `/reversi` | Jeu Reversi | ✅ |

---

## 🎮 GameBoard générique

`src/pages/Game/GameBoard.tsx` est agnostique du jeu — il reçoit :
- `cols`, `rows` : dimensions de la grille
- `cellsContent` : contenu de chaque cellule
- `handleCellClick` : callback au clic

Chaque page jeu passe ses propres props et gère sa logique WebSocket :
- `socket.on('game', handler)` au montage
- `socket.off('game', handler)` au unmount

---

## 🔌 WebSocket

```typescript
// Émettre
socket.emit('game', { eventType: 'play', roomName, cellName });

// Écouter
socket.on('game', (result: IGameEventData) => { ... });
```

`IGameEventData` : `{ eventType, turn, winner?, cells?, flippedCells?, pass?, error? }`

---

## 🎨 Thème & Styling

- Fond : `#131410` — Texte : `#4a8b53` — Accent : `#88ff88`
- Police : `Sixtyfour` (Google Fonts)
- `height: 100dvh` sur `html` et `body` uniquement (pas sur les enfants — scroll parasite iOS)
- CSS pur pour composants simples, SCSS pour jeux et composants complexes
- MUI v7 uniquement pour les menus dropdown (styles via `sx` prop)

---

## 🐳 Docker

```bash
docker build -t oldschoolgames-frontend:latest .
docker run -p 80:80 -e VITE_BACKEND_URL=http://backend:3000 oldschoolgames-frontend:latest
```

---

## 🚦 CI/CD

Pipeline Jenkins :
- ✅ Installation des dépendances
- ✅ Linting
- ✅ Build
- ✅ Build & Push image Docker
- ✅ Déploiement automatique

---

**Dernière mise à jour:** 2026-03-21
