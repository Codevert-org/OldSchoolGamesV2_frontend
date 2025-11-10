# OldSchoolGames V2 - Frontend

<div align="center">

**Interface web moderne pour jouer aux jeux rétro en ligne**

Built with **React 19** • **TypeScript** • **Vite** • **Socket.IO**

</div>

---

## 📋 À propos

OldSchoolGames V2 Frontend est une application web avec interface rétro/arcade qui offre une expérience utilisateur authentique pour jouer aux jeux classiques en ligne. Elle se connecte à l'API backend en temps réel via WebSocket pour synchroniser les parties entre joueurs.

### Fonctionnalités principales

- ✅ **Interface rétro arcade** - Thème vert CRT inspiré des années 80/90
- ✅ **Authentification JWT** - Gestion des tokens et sessions utilisateur
- ✅ **Profils personnalisés** - Upload d'avatars avec cropping interactif
- ✅ **Système d'invitations** - Inviter d'autres joueurs en temps réel
- ✅ **Communication temps réel** - WebSocket (Socket.IO) pour synchronisation live
- ✅ **Jeu Morpion multiplayer** - Tic-Tac-Toe complet avec grille interactive
- ✅ **Liste d'utilisateurs en ligne** - Affichage en temps réel des joueurs connectés
- ✅ **Build optimisé** - Vite pour performance maximale

---

## 🛠 Stack Technologique

| Catégorie | Technologies |
|-----------|--------------|
| **Framework** | React 19, TypeScript 5.8 |
| **Build Tool** | Vite 7.0 |
| **Temps réel** | Socket.IO Client 4.8 |
| **Routing** | React Router DOM 7.7 |
| **UI Components** | Material-UI 7.3 |
| **Styling** | CSS, SCSS |
| **Image Cropping** | React Easy Crop 5.5 |
| **HTTP Client** | Fetch API |
| **State Management** | React Context API |
| **Linting** | ESLint + TypeScript ESLint |

---

## 📁 Architecture du projet

```
src/
├── components/              # 11 composants réutilisables
│   ├── Box/                # Wrapper générique avec className
│   ├── Button/             # Bouton avec callback
│   ├── CropperModal/       # Modal de cropping d'image
│   ├── FormLine/           # Champ de formulaire wrapper
│   ├── Header/             # Barre de navigation supérieure
│   ├── LoginForm/          # Formulaire de connexion/inscription
│   ├── Switch/             # Toggle switch login/register
│   ├── UserItem/           # Carte utilisateur avec invitations
│   ├── UserList/           # Conteneur liste d'utilisateurs
│   ├── ProtectedContent.tsx # Guard de route (redirige vers login)
│   └── index.ts            # Exports centralisés
│
├── contexts/                # Context API pour l'état global
│   ├── appContext.ts       # État app (token, user)
│   └── wsContext.ts        # Connexion WebSocket (Socket.IO)
│
├── hooks/                   # Hooks personnalisés
│   └── useWsSocket.ts      # Hook pour accéder au contexte WebSocket
│
├── pages/                   # Pages et routes
│   ├── Dashboard/          # Liste utilisateurs, invitations
│   ├── Game/
│   │   ├── GameBoard.tsx   # Composant grille générique
│   │   └── Morpion/        # Jeu Tic-Tac-Toe
│   ├── Home/               # Layout principal avec Header
│   ├── Login/              # Page d'authentification
│   └── Profile/            # Édition profil, avatar, mot de passe
│
├── providers/               # Providers React
│   ├── AppProvider.tsx     # Initialise état app + localStorage
│   └── WsProvider.tsx      # Crée connexion Socket.IO
│
├── services/                # Services API HTTP
│   ├── auth.service.ts     # Endpoints auth (login/register)
│   ├── users.service.ts    # Endpoints utilisateurs
│   └── checkResponse.ts    # Gestion erreurs API
│
├── interfaces/              # Types TypeScript
│   ├── events/             # Types événements WebSocket
│   │   ├── IUsers.ts
│   │   └── IWsProvider.ts
│   ├── IApiError.ts
│   ├── IauthResponse.ts
│   └── IUserResponse.ts
│
├── utils/                   # Utilitaires
│   ├── canvasUtils.tsx     # Logique cropping image
│   ├── fade-scale.ts       # Transitions
│   └── constants/
│       └── extensions.ts   # Mapping MIME types
│
├── App.tsx                 # Composant racine avec Router
├── App.css                 # Styles App
├── index.css               # Styles globaux (thème rétro)
├── main.tsx                # Point d'entrée
└── vite-env.d.ts          # Types Vite
```

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js 18+
- npm ou yarn
- Backend OldSchoolGames en cours d'exécution sur `http://localhost:3000`

### Installation

```bash
# Cloner le repository
git clone <repository>
cd OldSchoolGames/V2/frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec VITE_BACKEND_URL=http://localhost:3000
```

### Variables d'environnement requises

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Démarrage

```bash
# Mode développement (avec hot reload)
npm run dev

# Preview du build production
npm run preview

# Build pour production
npm run build
```

### 🎨 Code Quality

```bash
# Vérifier le linting
npm run lint

# Corriger automatiquement les erreurs
npm run lint:fix
```

---

## 📱 Routes & Pages

| Route | Description | Authentification |
|-------|-------------|------------------|
| `/login` | Page de connexion/inscription | ❌ |
| `/` | Dashboard - Liste des joueurs | ✅ JWT |
| `/profile` | Profil utilisateur | ✅ JWT |
| `/morpion` | Partie Morpion (Tic-Tac-Toe) | ✅ JWT |

---

## 🔌 Intégration WebSocket

### Configuration Socket.IO

La connexion WebSocket est automatiquement gérée par `WsProvider.tsx`:

```typescript
// Déjà configuré dans WsProvider
const socket = io(`${BACKEND_URL}/events`, {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});
```

### Utilisation dans les composants

```typescript
import { useWsSocket } from '@/hooks/useWsSocket';

export function MyComponent() {
  const { socket } = useWsSocket();

  // Écouter les événements
  socket?.on('userList', (users) => {
    console.log('Utilisateurs connectés:', users);
  });

  // Émettre un événement
  socket?.emit('invitation', { toUserId: 5, game: 'morpion' });
}
```

### Événements WebSocket disponibles

- **userList** - Liste des utilisateurs connectés
- **invitation** - Gestion des invitations (create, accept, cancel)
- **game** - Événements du jeu (play, reload, leave)

---

## 🎮 Interface Morpion

### Fonctionnalités

- **Grille interactive 3x3** - Clic pour jouer
- **Affichage du tour** - Indique qui doit jouer (X ou O)
- **Détection de victoire** - Annonce automatique du gagnant
- **Gestion des égalités** - Détection et affichage
- **Rechargement** - Les deux joueurs doivent confirmer

**Fichiers relatifs:**
- `src/pages/Game/Morpion/Morpion.tsx` - Logique du jeu
- `src/pages/Game/GameBoard.tsx` - Composant grille réutilisable

---

## 🔐 Authentification

### Flow d'authentification

1. **Inscription** - Création de compte avec avatar optionnel
2. **Login** - Connexion avec email/mot de passe
3. **Token Storage** - JWT stocké en localStorage sous `accessToken`
4. **API Calls** - Toutes les requêtes API envoient le token
5. **WebSocket Connection** - Token passé lors de la connexion à `/events`

### Gestion du token

```typescript
// Token automatiquement récupéré depuis localStorage
const token = localStorage.getItem('accessToken');

// Utilisé dans les headers API
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// Et dans la connexion WebSocket
const socket = io(BACKEND_URL, {
  auth: { token }
});
```

---

## 📊 État global (Context API)

### AppContext

```typescript
{
  accessToken: string | null;
  user: User | null;
}
```

Fournit:
- Accès au token JWT
- Information utilisateur courant
- Persistance en localStorage

**Provider:** `AppProvider.tsx`
- Initialise depuis localStorage au montage
- Récupère l'utilisateur courant automatiquement

### WsContext

```typescript
{
  socket: Socket | null;
  ioClose: () => void;
}
```

Fournit:
- Accès à la connexion Socket.IO
- Fonction pour fermer la connexion

**Provider:** `WsProvider.tsx`
- Crée la connexion Socket.IO avec auth token
- Accessible uniquement dans les routes protégées

---

## 🎨 Thème & Styling

### Approche Styling

Le projet utilise une **approche mixte CSS/SCSS**:

1. **CSS scoped** - Co-localisé avec les composants
   - Box.css, Button.css, Header.css, etc.

2. **SCSS** - Pour les pages plus complexes
   - GameBoard.scss, Morpion.scss, UserItem.scss

3. **CSS Global** (index.css)
   - Thème rétro/arcade
   - Police customisée: "Sixtyfour" (Google Fonts)
   - Palette de couleurs années 80/90

### Palette de couleurs (Thème Rétro)

```css
/* Fond */
Background: #131410 (noir très foncé)

/* Texte principal */
Color: #4a8b53 (vert foncé)

/* Accents */
Accent lime: #88ff88 (vert clair/lime)

/* Input styling */
CRT-style 3D borders
Arcade feel avec fonts rétro
```

### Composants UI

Tous les composants UI sont localisés dans `/src/components`:
- Réutilisables et flexibles
- Styling co-localisé
- Support du thème rétro cohérent

---

## 🖼️ Gestion des avatars

### Upload et Cropping

```typescript
// Utilise react-easy-crop
import { CropperModal } from '@/components';

// Workflow:
// 1. User sélectionne une image
// 2. CropperModal s'ouvre
// 3. User crope l'image interactivement
// 4. Image convertie en Data URI via canvas
// 5. Envoyée au backend en FormData
```

**Fichiers:**
- `src/components/CropperModal/CropperModal.tsx` - Composant modal
- `src/utils/canvasUtils.tsx` - Logique de cropping et conversion

---

## 🐳 Docker

### Build l'image Docker

```bash
docker build -t oldschoolgames-frontend:latest .
```

### Lancer le conteneur

```bash
docker run -p 80:80 \
  -e VITE_BACKEND_URL=http://backend:3000 \
  oldschoolgames-frontend:latest
```

---

## 🚦 CI/CD Pipeline

Pipeline Jenkins automatisé pour:
- ✅ Installation des dépendances
- ✅ Linting du code
- ✅ Build de l'application
- ✅ Build & Push image Docker
- ✅ Déploiement automatique

**Déploiement multi-environnements:**
- Feature branches → Preview deployment
- Branche dev → Dev environment
- Branche main → Production (latest tag)

---

## 🤝 Contribution

Pour contribuer au projet:

1. Créer une feature branch: `git checkout -b feature/description`
2. Commit vos changements: `git commit -m "type: description"`
3. Push vers la branche: `git push origin feature/description`
4. Ouvrir une Pull Request

---

## 📄 License

Proprietary - Codevert Organization

---

## 📧 Support

Pour des questions ou rapports de bug, consultez la section Issues du repository.

**API Backend:** http://localhost:3000
**Frontend:** http://localhost:5173 (Vite)
**WebSocket:** ws://localhost:3000/events

---

## 🔗 Ressources utiles

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [React Easy Crop](https://github.com/ValentinH/react-easy-crop)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Dernière mise à jour:** 2025-11-02
