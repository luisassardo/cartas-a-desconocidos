<div align="center">

# ✉️ Cartas a Desconocidos

**Intercambio Anónimo de Cartas Escritas a Mano**

Conecta con desconocidos a través del arte perdido de las cartas.
Completamente anónimo, seguro y reconfortante.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Sobre el proyecto

Plataforma web para organizar intercambios anónimos de cartas escritas a mano. Los participantes se registran con un seudónimo, proporcionan su dirección (encriptada con AES-256), y el sistema los empareja aleatoriamente para que se escriban cartas entre desconocidos.

Incluye un programa especial para escribir a personas mayores en hospicios.

## ✨ Características

- **Registro público** con seudónimos generados o personalizados
- **Encriptación AES-256-CBC** de todos los datos personales
- **Emparejamiento aleatorio** con algoritmo de derangement (nadie se escribe a sí mismo)
- **Programa de hospicio** — opción para escribir a residentes de hospicios
- **Panel de administración** completo:
  - 📊 Dashboard con estadísticas en tiempo real
  - 👥 Gestión de participantes (ver datos desencriptados, eliminar)
  - 🔀 Generación y guardado de emparejamientos aleatorios
  - 📧 Control de estado de emails enviados
  - ✏️ **Editor de textos** del sitio (todos los textos son editables en vivo)
  - 🖼️ **Gestión de imágenes** (subir, organizar por sección, eliminar)
  - 📦 **Exportación** de base de datos completa como JSON
  - ⚠️ Zona de peligro para resetear datos
- **Zero dependencias externas** — SQLite embebido, sin necesidad de servicios cloud
- **Listo para Docker** — despliegue con un solo comando

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| Base de datos | SQLite (better-sqlite3) |
| Frontend | Vanilla JS SPA |
| Estilos | CSS custom |
| Tipografías | Fraunces · DM Sans · JetBrains Mono |
| Encriptación | AES-256-CBC (crypto nativo) |

## 🚀 Inicio rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) 20+ **o** [Docker](https://docker.com/)

### Opción 1 — Node.js

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/cartas-a-desconocidos.git
cd cartas-a-desconocidos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# ⚠️ Editar .env con tus propios valores

# Iniciar
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

### Opción 2 — Docker

```bash
git clone https://github.com/tu-usuario/cartas-a-desconocidos.git
cd cartas-a-desconocidos

# Levantar con docker compose
docker compose up -d
```

O build manual:

```bash
docker build -t cartas .
docker run -d -p 3000:3000 \
  -e ADMIN_PASSWORD=tu-password-seguro \
  -e ENCRYPTION_KEY=tu-clave-de-encriptacion-larga \
  -v $(pwd)/uploads:/app/uploads \
  cartas
```

## ☁️ Despliegue en VPC

<details>
<summary><strong>AWS / GCP / Azure / DigitalOcean</strong></summary>

1. Crear una instancia (Ubuntu 22+ recomendado, mínimo 512MB RAM)
2. Instalar Node.js 20+ o Docker
3. Clonar el repositorio
4. Configurar `.env`
5. Ejecutar con `npm start` o `docker compose up -d`
6. (Opcional) Configurar nginx como reverse proxy:

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 5M;
}
```

7. (Recomendado) Añadir HTTPS con [Certbot](https://certbot.eff.org/):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

</details>

## ⚙️ Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `ADMIN_PASSWORD` | Contraseña del panel admin | `cartas-admin-2024` |
| `ENCRYPTION_KEY` | Clave AES-256 para datos personales | `default-key` |
| `SESSION_SECRET` | Secreto para tokens de sesión | `secret` |

> [!WARNING]
> **Cambia todas las claves por defecto antes de usar en producción.**

## 📁 Estructura

```
cartas-a-desconocidos/
├── server.js            # Servidor Express + API completa
├── package.json
├── .env.example         # Plantilla de variables de entorno
├── Dockerfile
├── docker-compose.yml
├── LICENSE
├── SECURITY.md
├── public/
│   ├── index.html       # SPA entry point
│   ├── css/
│   │   └── styles.css   # Sistema de diseño completo
│   └── js/
│       └── app.js       # Frontend SPA (router, vistas, lógica)
├── uploads/             # Imágenes subidas (gitignored)
│   └── .gitkeep
└── data/                # Base de datos SQLite (se crea automáticamente, gitignored)
    └── cartas.db
```

## 🔌 API

<details>
<summary><strong>Endpoints públicos</strong></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/config` | Textos del sitio |
| `GET` | `/api/images` | Imágenes del sitio |
| `GET` | `/api/pseudonym` | Generar seudónimo aleatorio |
| `GET` | `/api/pseudonym/check/:name` | Verificar disponibilidad |
| `POST` | `/api/register` | Registrar participante |

</details>

<details>
<summary><strong>Endpoints admin</strong> (requieren autenticación via cookie)</summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/admin/login` | Iniciar sesión |
| `POST` | `/api/admin/logout` | Cerrar sesión |
| `GET` | `/api/admin/check` | Verificar autenticación |
| `GET` | `/api/admin/stats` | Estadísticas del dashboard |
| `GET` | `/api/admin/participants` | Listar participantes (desencriptados) |
| `DELETE` | `/api/admin/participants/:id` | Eliminar participante |
| `GET` | `/api/admin/matches` | Listar emparejamientos |
| `POST` | `/api/admin/generate-matches` | Generar emparejamientos aleatorios |
| `POST` | `/api/admin/save-matches` | Guardar emparejamientos generados |
| `POST` | `/api/admin/send-emails` | Marcar emails como enviados |
| `POST` | `/api/admin/clear-all` | Borrar todos los datos |
| `PUT` | `/api/admin/config` | Actualizar textos del sitio |
| `POST` | `/api/admin/images` | Subir imagen (multipart) |
| `DELETE` | `/api/admin/images/:id` | Eliminar imagen |
| `GET` | `/api/admin/export` | Exportar DB completa como JSON |

</details>

## 🔒 Seguridad

- **Encriptación AES-256-CBC** para nombre, dirección, ciudad, código postal y país
- **Token de sesión** derivado de contraseña + secreto (SHA-256)
- **Cookies httpOnly** con `SameSite=Strict`
- **Prepared statements** en todas las consultas SQL (prevención de inyección)
- **Validación de tipo** en uploads de imágenes (solo JPEG, PNG, GIF, WebP, SVG)
- **Límite de 5MB** por archivo subido

> [!NOTE]
> Para producción se recomienda añadir HTTPS (via nginx + Certbot), rate limiting, y CORS estricto.

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

### Ideas para contribuir

- [ ] Integración con servicio de email real (Resend, SendGrid, SES)
- [ ] Soporte multi-idioma (i18n)
- [ ] Autenticación admin más robusta (2FA)
- [ ] Dashboard con gráficas de participación
- [ ] Notificaciones por email cuando hay suficientes participantes
- [ ] Opción de "rondas" de intercambio con fechas

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver [`LICENSE`](LICENSE) para más información.

---

<div align="center">

Hecho con ❤️ para conectar desconocidos a través de cartas

</div>
