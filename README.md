# Cali Motors Frontend

Frontend de Cali Motors, un marketplace moderno para explorar, publicar, comprar, financiar y cotizar SOAT de vehículos desde una experiencia visual clara, responsive y comercial.

## Tabla De Contenido

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Características](#características)
- [Estructura Del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Variables De Entorno](#variables-de-entorno)
- [Instalación](#instalación)
- [Ejecución Local](#ejecución-local)
- [Rutas Principales](#rutas-principales)
- [Conexión Con El Backend](#conexión-con-el-backend)
- [Notas De UI](#notas-de-ui)
- [Notas Importantes](#notas-importantes)

## Descripción

Esta aplicación permite a los usuarios:

- Registrarse e iniciar sesión.
- Explorar vehículos publicados.
- Buscar y filtrar vehículos.
- Ver detalle de un vehículo.
- Publicar vehículos.
- Editar publicaciones propias.
- Gestionar perfil.
- Iniciar flujos visuales de compra, financiación y cotización SOAT.

Los flujos de compra, financiación y SOAT son visuales y referenciales. No integran pasarelas de pago reales.

## Tecnologías

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- SWR
- Radix UI
- Vercel Analytics

## Características

- Diseño responsive.
- Marketplace con tarjetas de vehículos.
- Modo oscuro.
- Animaciones suaves.
- Buscador con filtros.
- Popup discreto de vehículo destacado.
- Formularios visualmente pulidos.
- Conexión con API mediante `fetchWithAuth`.
- Checkout visual profesional sin pagos reales.

## Estructura Del Proyecto

```txt
Cali_Motors_Front/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── sign-up-success/
│   ├── profile/
│   ├── protected/
│   ├── vehicles/
│   │   ├── new/
│   │   └── [Id]/
│   │       ├── comprar/
│   │       ├── financiar/
│   │       ├── cotizar-soat/
│   │       ├── edit/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard-content.tsx
│   └── ui/
├── lib/
│   ├── api.ts
│   └── utils.ts
├── package.json
├── yarn.lock
└── README.md
```

## Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

- Node.js 18 o superior.
- Yarn.
- Backend de Cali Motors corriendo localmente o desplegado.

## Variables De Entorno

Crea un archivo `.env.local` en la raíz del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Variables

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend de Cali Motors. |

## Instalación

Desde la carpeta del frontend:

```bash
cd Cali_Motors_Front
yarn install --frozen-lockfile
```

Si no necesitas bloquear estrictamente el lockfile:

```bash
yarn install
```

## Ejecución Local

Modo desarrollo:

```bash
yarn dev
```

La aplicación queda disponible normalmente en:

```txt
http://localhost:3000
```

## Build De Producción

Para compilar:

```bash
yarn build
```

Para iniciar el build:

```bash
yarn start
```

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `yarn dev` | Inicia el servidor de desarrollo. |
| `yarn build` | Genera el build de producción. |
| `yarn start` | Ejecuta la app compilada. |
| `yarn lint` | Ejecuta ESLint. |

## Rutas Principales

| Ruta | Descripción |
|---|---|
| `/` | Página principal. |
| `/auth/login` | Inicio de sesión. |
| `/auth/sign-up` | Registro de usuario. |
| `/protected` | Marketplace y dashboard principal. |
| `/profile` | Perfil del usuario. |
| `/vehicles/new` | Publicar vehículo. |
| `/vehicles/[Id]` | Detalle del vehículo. |
| `/vehicles/[Id]/edit` | Editar vehículo. |
| `/vehicles/[Id]/comprar` | Flujo visual de compra. |
| `/vehicles/[Id]/financiar` | Flujo visual de financiación. |
| `/vehicles/[Id]/cotizar-soat` | Cotización referencial de SOAT. |

## Conexión Con El Backend

El frontend usa el helper:

```txt
lib/api.ts
```

Este helper agrega el token JWT desde `localStorage` cuando existe:

```http
Authorization: Bearer TOKEN
```

Para que la app funcione localmente, primero inicia el backend:

```bash
cd ../
npm run dev
```

Luego inicia el frontend:

```bash
cd Cali_Motors_Front
yarn dev
```

## Flujo Recomendado De Desarrollo

1. Iniciar backend en `http://localhost:3001`.
2. Configurar `.env.local` con `NEXT_PUBLIC_API_URL`.
3. Iniciar frontend con `yarn dev`.
4. Crear usuario o iniciar sesión.
5. Entrar a `/protected`.
6. Publicar, explorar o editar vehículos.

## Notas De UI

La interfaz incluye:

- Modo oscuro.
- Animaciones suaves.
- Cards de vehículos con botón de acción alineado.
- Precio animado tipo odómetro en el detalle.
- Formularios con estados visuales.
- Filtros y búsqueda en marketplace.
- Diseño responsive para móvil y escritorio.

## Imágenes De Vehículos

Recomendación para que las imágenes se vean bien:

| Uso | Tamaño recomendado | Relación |
|---|---:|---|
| Tarjetas de marketplace | `1600 x 1000 px` | 16:10 |
| Detalle de vehículo | `1600 x 1200 px` | 4:3 |
| Alternativa general | `1200 x 750 px` | 16:10 |

Consejo: mantén el vehículo centrado y con aire alrededor para evitar recortes por `object-cover`.

## Notas Importantes

- No hay pagos reales implementados.
- No hay integración con Stripe, PayPal, MercadoPago ni pasarelas externas.
- Compra, financiación y SOAT son flujos visuales/referenciales.
- El backend y frontend son repositorios separados.
- No subas `.env.local` con datos sensibles.
- El parámetro dinámico del detalle usa `Id`, porque la carpeta es `[Id]`.

