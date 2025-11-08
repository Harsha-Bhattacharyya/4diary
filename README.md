# 4Diary
> 🏆 **Hack This Fall 2025 Project** - A privacy-focused, end-to-end encrypted note-taking application built with Next.js.

A privacy-focused, end-to-end encrypted note-taking application built with Next.js. Think Notion, but with military-grade encryption and complete privacy.

## ✨ Features

- 🔒 **End-to-End Encryption**: AES-256-GCM encryption using Web Crypto API
- ✍️ **Notion-like Editor**: Rich text editing with BlockNote
- 📁 **Smart Organization**: Folders, tags, favorites, and archives
- 📥 **Export Freedom**: Export as Markdown or ZIP files
- 📦 **Self-Hostable**: Docker-ready deployment
- 🔐 **Zero Knowledge**: Server never sees unencrypted content
- 📄 **Templates**: Pre-built templates for various use cases

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Harsha-Bhattacharyya/4diary.git
cd 4diary
```

2. Install dependencies:
```bash
npm install
```

3. Create enviroment variable with your MongoDB URI:
```bash
export MONGODB_URI=mongodb://localhost:27017/4diary
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🐳 Self-Hosting with Docker

### Using Docker Compose (Recommended)

1. Clone the repository
2. Export your MongoDB URI,Redis,port
3. Run:

```bash
docker-compose up -d
```

This will start:
- Next.js app on port 3000
- MongoDB on port 27017
- Redis on port 6379

### With Database Management UI

To also run Mongo Express for database management:

```bash
docker-compose --profile debug up -d
```

Access Mongo Express at http://localhost:8081 (default credentials: admin/changeme)

### Production Deployment

For production, update the `docker-compose.yml` with:
- Secure MongoDB credentials
- Environment-specific configurations
- SSL/TLS certificates
- Reverse proxy setup (nginx/Caddy)

## 🏗️ Architecture

### Encryption Flow

1. **Master Key Generation**: Generated in browser, stored in IndexedDB
2. **Document Keys**: Each document has its own encryption key
3. **Key Encryption**: Document keys are encrypted with master key
4. **Content Encryption**: Document content encrypted with document key
5. **Server Storage**: Only encrypted data reaches the server

### Database Schema

- **workspaces**: User workspaces with encrypted master keys
- **documents**: Encrypted documents with searchable metadata
- **templates**: Document templates
- **analytics_events**: Privacy-respecting usage analytics

## 📚 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Editor**: BlockNote
- **Database**: MongoDB
- **Encryption**: Web Crypto API
- **Animation**: Framer Motion
- **Export**: JSZip

## 🔐 Security

- Client-side only encryption
- AES-256-GCM encryption algorithm
- Master keys never leave the browser
- Server has zero knowledge of content
- PBKDF2 for password-based key derivation
- 100,000 iterations for key strengthening

## 📖 Usage

### Creating Documents

1. Navigate to the workspace
2. Click "New Document" or choose a template
3. Start writing - auto-save is enabled
4. Content is encrypted automatically before saving

### Using Templates

1. Go to Templates page
2. Browse categories (journal, work, productivity)
3. Click "Use Template" to start with pre-built structure
4. Customize to your needs

### Exporting Data

1. Go to Settings
2. Click "Export Workspace"
3. Downloads ZIP with all documents as Markdown files
4. Maintains folder structure

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD-3 Clause License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- BlockNote for the amazing editor
- Next.js team for the framework
- MongoDB for the database
- All open-source contributors

## 📞 Support

For issues and questions, please use the GitHub issue tracker.

---

Built with ♥️ in  🇮🇳
