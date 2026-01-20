# 🚀 Plan de Migración: De HTML a Next.js

## Resumen Ejecutivo

Migrar el prototipo actual del Roadmap Visual (HTML + Tailwind CDN) a una aplicación completa con **Next.js 14 + React + TypeScript**.

---

## 📊 Estado Actual vs Objetivo

| Aspecto | Actual (Prototipo) | Objetivo (Next.js) |
|---------|-------------------|-------------------|
| Estructura | 1 archivo HTML | Componentes React |
| Estilos | Tailwind CDN | Tailwind instalado |
| Datos | Hardcodeados | Base de datos |
| Usuarios | Estático | Autenticación real |
| Rutas | Ninguna | Múltiples páginas |
| Deploy | Archivo local | Vercel/Servidor |

---

## 🏗️ Arquitectura Propuesta

```
learnquest-app/
├── app/                      # App Router (Next.js 14)
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard del usuario
│   ├── roadmap/
│   │   └── page.tsx          # ⭐ Vista del Roadmap
│   ├── profile/
│   │   └── page.tsx          # Perfil del usuario
│   └── api/                  # API Routes
│       ├── auth/
│       ├── progress/
│       └── users/
│
├── components/
│   ├── ui/                   # Componentes base
│   │   ├── GlassPanel.tsx
│   │   ├── Button.tsx
│   │   └── Avatar.tsx
│   ├── roadmap/
│   │   ├── RoadmapCanvas.tsx # SVG con las curvas
│   │   ├── PathNode.tsx      # Nodo individual
│   │   ├── UserMarker.tsx    # Avatar en el mapa
│   │   └── FinalGoal.tsx     # Destino convergente
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── StatsRadar.tsx
│   │   └── Achievements.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── ThemeToggle.tsx
│
├── lib/
│   ├── db.ts                 # Conexión a base de datos
│   ├── auth.ts               # Configuración de auth
│   └── utils.ts              # Utilidades
│
├── hooks/
│   ├── useTheme.ts
│   ├── useProgress.ts
│   └── useUser.ts
│
├── types/
│   └── index.ts              # Tipos TypeScript
│
└── styles/
    └── globals.css           # Estilos globales + Tailwind
```

---

## 📅 Fases de Migración

### Fase 1: Setup Inicial (1-2 días)
- [ ] Crear proyecto Next.js 14 con TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar fuentes (Space Grotesk)
- [ ] Trasladar estilos CSS personalizados (glassmorphism, animaciones)
- [ ] Crear componente de tema claro/oscuro

### Fase 2: Componentes Base (2-3 días)
- [ ] `GlassPanel` - Panel con efecto glassmorphism
- [ ] `Navbar` - Barra de navegación
- [ ] `ThemeToggle` - Botón de cambio de tema
- [ ] `Avatar` - Componente de avatar reutilizable
- [ ] `ProgressBar` - Barra de progreso animada

### Fase 3: Roadmap Visual (3-4 días)
- [ ] `RoadmapCanvas` - Contenedor SVG principal
- [ ] `BezierPath` - Componente para curvas de Bézier
- [ ] `PathNode` - Nodo con estados (completado, actual, bloqueado)
- [ ] `UserMarker` - Avatar flotante en el mapa
- [ ] `FinalGoal` - Punto de convergencia animado
- [ ] Animaciones con Framer Motion

### Fase 4: Perfil y Stats (2-3 días)
- [ ] `ProfileCard` - Tarjeta de perfil
- [ ] `StatsRadar` - Gráfico radar SVG
- [ ] `AchievementCard` - Logros
- [ ] `DailyQuest` - Misión diaria
- [ ] `ActiveUsers` - Lista de usuarios activos

### Fase 5: Backend y Datos (3-5 días)
- [ ] Configurar base de datos (PostgreSQL/MongoDB)
- [ ] Prisma ORM para modelos
- [ ] API Routes para:
  - `/api/users` - CRUD usuarios
  - `/api/progress` - Progreso del roadmap
  - `/api/achievements` - Logros
- [ ] Autenticación (NextAuth.js o Clerk)

### Fase 6: Pulido Final (2-3 días)
- [ ] Optimización de rendimiento
- [ ] SEO y meta tags
- [ ] Responsive design (móvil/tablet)
- [ ] Testing básico
- [ ] Deploy en Vercel

---

## 🛠️ Stack Tecnológico Recomendado

| Categoría | Tecnología | Razón |
|-----------|-----------|-------|
| **Framework** | Next.js 14 | App Router, Server Components |
| **Lenguaje** | TypeScript | Tipado estático, mejor DX |
| **Estilos** | Tailwind CSS | Ya lo usamos, fácil migrar |
| **Animaciones** | Framer Motion | Animaciones declarativas React |
| **Base de Datos** | PostgreSQL + Prisma | Robusto y type-safe |
| **Autenticación** | NextAuth.js | Fácil integración con Next.js |
| **Deploy** | Vercel | Optimizado para Next.js |
| **Iconos** | Lucide React | Similar a Material pero React |

---

## 💡 Ejemplo: Componente PathNode

```tsx
// components/roadmap/PathNode.tsx
'use client';

import { motion } from 'framer-motion';

type NodeStatus = 'completed' | 'current' | 'locked';

interface PathNodeProps {
  status: NodeStatus;
  title: string;
  position: { x: number; y: number };
  color: string;
}

export function PathNode({ status, title, position, color }: PathNodeProps) {
  const icons = {
    completed: 'check',
    current: 'play_arrow',
    locked: 'lock'
  };

  return (
    <motion.div
      className="absolute z-10 group"
      style={{ top: position.y, left: position.x }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <div 
        className={`w-8 h-8 rounded-full bg-background-dark border-2 
          flex items-center justify-center shadow-lg
          ${status === 'locked' ? 'border-white/10 text-gray-600' : `border-${color}-500 text-${color}-500`}
        `}
      >
        <span className="material-symbols-outlined text-[16px]">
          {icons[status]}
        </span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="glass-panel absolute left-10 top-0 p-2 rounded-lg 
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-xs font-bold">{title}</p>
      </div>
    </motion.div>
  );
}
```

---

## 📈 Beneficios Post-Migración

1. **Mantenibilidad** - Código organizado en componentes
2. **Escalabilidad** - Fácil agregar nuevas features
3. **Performance** - Server Components, code splitting
4. **SEO** - Renderizado del lado del servidor
5. **Datos dinámicos** - Conexión con base de datos real
6. **Colaboración** - Estructura estándar de la industria

---

## ⏱️ Tiempo Estimado Total

| Fase | Duración |
|------|----------|
| Setup + Componentes Base | 3-5 días |
| Roadmap Visual | 3-4 días |
| Perfil y Stats | 2-3 días |
| Backend | 3-5 días |
| Pulido + Deploy | 2-3 días |
| **Total** | **13-20 días** |

---

## 🚦 Próximos Pasos

1. ✅ Aprobar este plan de migración
2. ⬜ Crear proyecto Next.js con configuración inicial
3. ⬜ Comenzar con Fase 1: Setup

---

*Documento creado: Enero 2026*
*Última actualización: Al aprobar el plan*
