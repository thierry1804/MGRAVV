# Application de Gestion AVV

## 📋 Description
Application web de gestion des AVV (Avis de Vérification de Véhicule) avec interface Kanban, système de pièces jointes et suivi des modifications. L'application fonctionne entièrement en local avec une base de données SQLite stockée dans le localStorage du navigateur.

## 🚀 Fonctionnalités Principales

### Gestion des AVV
- Création et édition des AVV avec :
  - Nom du client
  - Nom du projet
  - Budget
  - Date limite
  - Besoins spécifiques
  - Technologies utilisées
- Interface Kanban pour le suivi des statuts
- Système de filtrage et recherche

### Gestion Documentaire
- Upload et gestion des pièces jointes
- Prévisualisation des documents
- Stockage local sécurisé
- Suivi des modifications des fichiers

### Historique et Notifications
- Historique complet des modifications
- Système de notifications intégré
- Traçabilité des changements
- Alertes personnalisables

## 🛠 Technologies

### Frontend
- React
- TypeScript
- Zustand (gestion d'état)
- TailwindCSS (styles)

### Base de données
- SQL.js
- Stockage local (localStorage)

## 📦 Installation

1. Cloner le repository
```bash
git clone [url-du-repo]
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer l'application
```bash
npm run dev
```

## 📁 Structure du Projet

```
src/
├── components/
│   ├── AVVForm.tsx      # Formulaire AVV
│   ├── Attachments.tsx  # Gestion fichiers
│   └── KanbanBoard.tsx  # Interface Kanban
├── store/
│   ├── avvStore.ts          # Store principal
│   ├── attachmentStore.ts   # Store fichiers
│   ├── notificationStore.ts # Store notifications
│   └── historyStore.ts      # Store historique
├── db/
│   └── schema.ts       # Schéma base de données
└── App.tsx            # Point d'entrée
```

## 💾 Base de données

L'application utilise une base de données SQLite avec les tables suivantes :

### Tables principales
- `avvs` : Stockage des AVV (client, projet, budget, deadline, etc.)
- `comments` : Système de commentaires liés aux AVV
- `notifications` : Gestion des alertes et notifications
- `avv_history` : Suivi des modifications des AVV
- `attachments` : Gestion des fichiers joints

## 🖥 Utilisation

### Création d'un AVV
1. Cliquer sur "Nouveau AVV"
2. Remplir les informations requises
3. Ajouter des pièces jointes si nécessaire
4. Valider le formulaire

### Gestion des AVV
- Glisser-déposer les AVV entre les colonnes du Kanban
- Filtrer et rechercher les AVV
- Consulter l'historique des modifications
- Gérer les pièces jointes

### Notifications
- Réception d'alertes pour les modifications importantes
- Système de marquage comme lu/non lu
- Filtrage par type de notification

## ⚠️ Points importants

### Stockage Local
- Les données sont stockées dans le localStorage du navigateur
- Taille de stockage limitée selon le navigateur
- Prévoir des exports réguliers des données

### Sécurité
- Données stockées uniquement en local
- Pas de synchronisation avec un serveur
- Sauvegardes recommandées

## 🔄 Sauvegarde et Restauration

### Export des données
- Export automatique dans le localStorage
- Sauvegarde des pièces jointes encodées
- Conservation de l'historique complet

### Import des données
- Restauration automatique au chargement
- Vérification d'intégrité
- Conservation de l'historique

## 🤝 Contribution

1. Fork du projet
2. Création de branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Création d'une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 📧 Support

Pour toute question ou problème :
- Ouvrir une issue sur le repository
- Consulter la documentation
- Contacter l'équipe de développement
