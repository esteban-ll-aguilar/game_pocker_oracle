# 🔮 Oráculo de la Suerte - Juego de Cartas Místico

Un juego de cartas interactivo desarrollado en React que combina estrategia, suerte y elementos místicos. El objetivo es organizar las 52 cartas de una baraja estándar en sus grupos correspondientes (1-13) sin caer en las trampas del oráculo.

## 🎮 Descripción del Juego

El **Oráculo de la Suerte** es un juego de cartas único donde:
- Debes revelar cartas de diferentes grupos y colocarlas en el grupo que corresponde a su valor numérico
- Las cartas A=1, 2-10=valor numérico, J=11, Q=12, K=13
- Si revelas una carta que pertenece al mismo grupo desde donde la sacaste, pierdes
- El objetivo es vaciar todos los grupos de cartas ocultas para ganar

### Modos de Juego
- **Modo Manual**: Controlas cada movimiento con clics del mouse
- **Modo Automático**: La IA juega por ti con algoritmos optimizados
- **Velocidades**: Lenta, Normal y Rápida (solo en modo automático)

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Desplegar a Firebase (requiere configuración)
firebase deploy
```

## 📁 Estructura del Proyecto

### Archivos de Configuración

- **`package.json`**: Configuración del proyecto React con dependencias como React 19, Tailwind CSS, Anime.js para animaciones
- **`tailwind.config.js`**: Configuración de Tailwind CSS para estilos
- **`firebase.json`**: Configuración para despliegue en Firebase Hosting
- **`.firebaserc`**: Configuración del proyecto Firebase
- **`.gitignore`**: Archivos y carpetas ignorados por Git
- **`.env`** y **`env.sample`**: Variables de entorno (configuración sensible)

### Directorio `public/`
Archivos estáticos de la aplicación:
- **`index.html`**: Página HTML principal
- **`favicon.ico`**: Icono de la aplicación
- **`logo192.png`**, **`logo512.png`**: Logos en diferentes tamaños
- **`manifest.json`**: Configuración para PWA (Progressive Web App)
- **`robots.txt`**: Instrucciones para crawlers web

### Directorio `src/`

#### Archivos Principales
- **`App.js`**: Componente principal que integra el sistema de temas, notificaciones y la vista del juego
- **`index.js`**: Punto de entrada de React
- **`App.css`**, **`index.css`**: Estilos globales y personalizados
- **`setupTests.js`**: Configuración para testing
- **`reportWebVitals.js`**: Métricas de rendimiento web

#### Backend (`src/backend/`)

##### Controladores (`src/backend/controllers/`)
- **`GameController.js`**: Controlador principal que coordina todos los servicios del juego
  - Maneja inicialización, inicio, reinicio del juego
  - Procesa clics en grupos y movimientos de cartas
  - Gestiona modos manual y automático
  - Coordina el flujo del juego y estados

##### Servicios (`src/backend/services/`)
- **`GameService.js`**: Lógica central del juego
  - Creación y barajado de cartas
  - Gestión de grupos y estados del juego
  - Algoritmos para modo automático
  - Validación de movimientos y reglas
  - Persistencia de preferencias del usuario

- **`OracleGenieService.js`**: Servicio del "Genio del Oráculo"
  - Análisis inteligente del estado del juego
  - Predicciones de probabilidad de victoria
  - Consejos estratégicos personalizados
  - Respuestas contextuales y motivacionales

- **`OracleMessageService.js`**: Gestión de mensajes del oráculo
  - Mensajes contextuales según el estado del juego
  - Narrativa inmersiva y atmosférica
  - Mensajes de bienvenida, victoria y derrota

- **`BoardLayoutService.js`**: Gestión del diseño del tablero
  - Estructura visual de los grupos de cartas
  - Posicionamiento y organización del tablero
  - Estadísticas del estado del tablero

- **`index.js`**: API unificada del backend
  - Exporta GameAPI con métodos simplificados
  - Interfaz entre frontend y backend
  - Singleton del controlador principal

#### Frontend (`src/fronted/`)

##### Componentes de Vista (`src/fronted/components/`)
- **`OracleGameView.jsx`**: Vista principal del juego
  - Integra todos los componentes
  - Maneja estados de UI y lógica de interacción
  - Gestiona modos automático y manual
  - Controla flujo de animaciones y transiciones

- **`GameBoardViewImproved.jsx`**: Tablero de juego mejorado
  - Renderiza los 13 grupos de cartas
  - Maneja interacciones con grupos
  - Animaciones de cartas y efectos visuales

- **`GameControlsViewEnhanced.jsx`**: Controles del juego
  - Botones de inicio, reinicio y configuración
  - Selector de modo de juego y velocidad
  - Panel de estadísticas y configuraciones

- **`OracleView.jsx`**: Vista del oráculo
  - Muestra mensajes místicos del oráculo
  - Efectos visuales y animaciones temáticas

- **`RiffleShuffleView.jsx`**: Animación de barajado
  - Simula barajado realista de cartas
  - Efectos visuales durante la preparación del juego

- **`CardView.jsx`**: Componente individual de carta
  - Renderizado de cartas con estilos temáticos
  - Animaciones de revelación y movimiento

- **`CardGroupView.jsx`**: Grupo de cartas
  - Contenedor para cartas de un grupo específico
  - Gestión de cartas ocultas y reveladas

- **`ModalView.jsx`**: Modal genérico
  - Ventanas modales reutilizables
  - Efectos de apertura y cierre

- **`CardRevealModal.jsx`**: Modal de revelación de cartas
  - Muestra cartas recién reveladas
  - Información sobre destino de la carta

- **`index.js`**: Exportaciones del frontend

#### Componentes Compartidos (`src/components/`)
- **`GenieChat.jsx`**: Chat interactivo con el Genio del Oráculo
  - Interfaz conversacional
  - Análisis y consejos en tiempo real
  - Predicciones de victoria

- **`NotificationSystem.jsx`**: Sistema de notificaciones
  - Mensajes de éxito, error, información
  - Notificaciones de logros
  - Gestión de múltiples notificaciones

- **`StatsPanel.jsx`**: Panel de estadísticas
  - Estadísticas de juego y rendimiento
  - Historial de partidas
  - Logros y achievements

- **`Modal.jsx`**: Modal básico
- **`Card.jsx`**: Carta básica
- **`GameBoard.jsx`**: Tablero básico
- **`GameControls.jsx`**: Controles básicos
- **`Oracle.jsx`**: Oráculo básico
- **`OracleGame.jsx`**: Juego básico
- **`RiffleShuffle.jsx`**: Barajado básico
- **`CardGroup.jsx`**: Grupo de cartas básico

#### Hooks Personalizados (`src/hooks/`)
- **`useTheme.js`**: Gestión de temas visuales
  - 5 temas disponibles: Místico, Bosque Encantado, Océano Profundo, Llamas Eternas, Cósmico
  - Persistencia de preferencias de tema
  - Animaciones de transición entre temas

- **`useGameStats.js`**: Estadísticas y logros del juego
  - Seguimiento de partidas jugadas
  - Sistema de achievements
  - Métricas de rendimiento

## 🎨 Características Técnicas

### Tecnologías Utilizadas
- **React 19**: Framework principal
- **Tailwind CSS**: Framework de estilos utilitarios
- **Anime.js**: Librería de animaciones
- **Firebase**: Hosting y despliegue
- **LocalStorage**: Persistencia de preferencias

### Arquitectura
- **Patrón MVC**: Separación clara entre lógica de negocio y presentación
- **Servicios modulares**: Cada funcionalidad en servicios especializados
- **Hooks personalizados**: Lógica reutilizable encapsulada
- **Context API**: Gestión de estado global para temas

### Características Destacadas
- **Modo Automático Inteligente**: IA que juega estratégicamente
- **Sistema de Temas**: 5 temas visuales diferentes
- **Genio del Oráculo**: Asistente IA con consejos y predicciones
- **Animaciones Fluidas**: Transiciones suaves y efectos visuales
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **PWA Ready**: Configurado como Progressive Web App

## 🎯 Funcionalidades del Juego

### Mecánicas Principales
1. **Barajado Realista**: Algoritmo que simula barajado humano imperfecto
2. **Revelación Estratégica**: Sistema de revelación de cartas con reglas específicas
3. **Modo Automático**: IA que analiza el tablero y toma decisiones óptimas
4. **Sistema de Predicciones**: Cálculo de probabilidades de victoria en tiempo real
5. **Persistencia de Preferencias**: Guarda configuraciones del usuario

### Sistema de Logros
- Victorias consecutivas
- Partidas rápidas
- Eficiencia en movimientos
- Uso de diferentes modos de juego

### Análisis Inteligente
- Evaluación de probabilidades de victoria
- Recomendaciones estratégicas
- Análisis de patrones de juego
- Consejos adaptativos según el progreso

## 🔧 Desarrollo y Contribución

### Scripts de Desarrollo
```bash
# Modo desarrollo con hot reload
npm start

# Build optimizado para producción
npm run build

# Ejecutar suite de tests
npm test

# Análisis del bundle
npm run build && npx serve -s build
```

### Estructura de Commits
El proyecto sigue convenciones de commits semánticos para un historial claro.

## 🚀 Despliegue

### Firebase Hosting
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Desplegar
firebase deploy
```

### Build de Producción
```bash
npm run build
```
Genera una carpeta `build/` optimizada para producción.

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, tablet, móvil (responsive)
- **PWA**: Instalable como aplicación nativa

## 🎮 Cómo Jugar

1. **Inicio**: Haz clic en "Nuevo Juego" para comenzar
2. **Barajado**: Observa la animación de barajado de cartas
3. **Revelación**: Comienza revelando una carta del grupo central (13)
4. **Movimiento**: Coloca la carta revelada en el grupo correspondiente a su valor
5. **Continuación**: Revela una carta del grupo donde colocaste la anterior
6. **Victoria**: Vacía todos los grupos para ganar
7. **Derrota**: Si revelas una carta del mismo grupo al que pertenece, pierdes

### Consejos Estratégicos
- Usa el Genio del Oráculo para obtener predicciones y consejos
- El modo automático es útil para aprender estrategias
- Observa los patrones de distribución de cartas
- Cada tema visual puede influir en tu concentración

---

**Desarrollado con ❤️ usando React y tecnologías modernas web**

*¿Tienes la suerte necesaria para dominar el Oráculo? ¡Descúbrelo jugando!* 🔮✨
