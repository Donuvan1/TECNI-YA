# Diagrama de Flujo - TECNI-YA

```mermaid
flowchart TD
    %% ESTILOS
    classDef auth fill:#1a1a2e,stroke:#bb86fc,stroke-width:2px,color:#fff
    classDef main fill:#16213e,stroke:#03dac6,stroke-width:2px,color:#fff
    classDef modulo fill:#2c2c3e,stroke:#bb86fc,stroke-width:1px,color:#fff
    classDef tool fill:#1a1a2e,stroke:#ff9800,stroke-width:1px,color:#fff
    classDef data fill:#0a0a0a,stroke:#00ff88,stroke-width:1px,color:#fff

    %% INICIO - LOGIN
    A[("🏠 **TECNI-YA**<br/>Inicio")] --> B{¿Usuario autenticado?}
    B -->|No| C[("🔐 **Login / Registro**<br/>- Email/Contraseña<br/>- Google")]
    C --> D{Autenticación<br/>exitosa?}
    D -->|No| C
    D -->|Sí| E

    B -->|Sí| E[("💬 **Chat Principal**<br/>(Red Social)")]

    class A,B,C,D auth

    %% CHAT PRINCIPAL
    E --> F[("👥 **Lista de Usuarios**")]
    E --> G[("💬 **Chat en Tiempo Real**<br/>- Mensajes de texto<br/>- Imágenes 📷<br/>- Audio 🎤<br/>- Ubicación 📍")]
    E --> H[("📸 **Mi Galería**<br/>- Subir fotos<br/>- Establecer foto de perfil")]

    class E,F,G,H main

    %% MÓDULO DE PROYECTOS
    E --> I[("🛠️ **Módulo Proyectos**")]
    click I "proyectos-tecnicos/proyectos.html"

    I --> J[("🏗️ **Obras**<br/>(Cotizador de Ventanas)")]
    click J "proyectos-tecnicos/obras.html"

    I --> K[("✂️ **Optimizador de Corte**<br/>(Planchas de Vidrio)")]
    click K "proyectos-tecnicos/optimizadorcortes.html"

    I --> L[("📐 **Optimizador de Varillas**<br/>(Perfiles de Aluminio)")]
    click L "proyectos-tecnicos/optimizadorvarillas.html"

    I --> M[("🗄️ **Base de Datos**<br/>(Materiales y Precios)")]
    click M "proyectos-tecnicos/basededatos.html"

    I --> N[("⏳ **Calculadora Técnica**<br/>(Próximamente)")]
    I --> O[("⏳ **Notas Técnicas**<br/>(Próximamente)")]

    class I,J,K,L,M,N,O modulo

    %% SUBMÓDULO OBRAS - COTIZADOR
    J --> P{Seleccionar<br/>Tipo de Pedido}
    P -->|Sistema| Q[("🪟 **Ventanas Sistema**<br/>- Medidas generales<br/>- Configuración de puente<br/>- Cálculo de cortes")]
    P -->|Serie 80| R[("🪟 **Serie 80**<br/>- Medidas generales<br/>- Configuración de puente<br/>- Cálculo de cortes")]
    P -->|Serie 60| S[("🪟 **Serie 60**<br/>- Medidas generales<br/>- Configuración de puente<br/>- Cálculo de cortes")]

    Q --> T[("📋 **Resultados**<br/>- Medidas de corte<br/>- Aluminios requeridos<br/>- Vidrios requeridos<br/>- Accesorios requeridos<br/>- Tiras requeridas<br/>- Resumen de producción")]
    R --> T
    S --> T

    Q --> U[("🔧 **Panel Admin**<br/>- Editar precios de perfiles<br/>- Editar accesorios<br/>- Editar tiras<br/>- Editar vidrios")]
    R --> U
    S --> U

    class P,Q,R,S,T,U tool

    %% OPTIMIZADOR DE CORTE
    K --> V[("📐 **Datos del Trabajo**<br/>- Cliente<br/>- Tipo de vidrio")]
    K --> W[("📏 **Tamaño de Plancha**<br/>(330x214 cm)")]
    K --> X[("📝 **Ingreso de Piezas**<br/>- Uso, Ancho, Alto, Cantidad")]
    X --> Y[("⚡ **Optimizar**")]
    Y --> Z[("📊 **Resultados**<br/>- Planchas totales<br/>- Distribución visual<br/>- Múltiples soluciones<br/>- Descargar imagen")]

    class V,W,X,Y,Z tool

    %% OPTIMIZADOR DE VARILLAS
    L --> AA[("📦 **Material Base (Stock)**<br/>- Código, Largo, Cantidad")]
    L --> AB[("✂️ **Piezas a Cortar**<br/>- Uso, Código, Medida, Cantidad")]
    AB --> AC[("⚡ **Optimizar**")]
    AC --> AD[("📊 **Reporte de Corte**<br/>- Resumen de piezas<br/>- Varillas por código<br/>- Distribución visual<br/>- Imprimir / PDF")]

    class AA,AB,AC,AD tool

    %% BASE DE DATOS
    M --> AE[("📂 **Categorías**<br/>- Varillas 🔩<br/>- Planchas 🪟<br/>- Tiras 📏<br/>- Accesorios 🔧<br/>- Otros 📦")]
    M --> AF[("🎨 **Filtros por Color**")]
    M --> AG[("🔍 **Buscador General**")]
    M --> AH[("➕ **Agregar / Editar / Eliminar**")]
    M --> AI[("💾 **Guardar en Firebase**")]

    class AE,AF,AG,AH,AI data

    %% FIREBASE - BACKEND
    AJ[("☁️ **Firebase**")]
    AJ --> AK[("🔐 **Authentication**<br/>(Email/Google)")]
    AJ --> AL[("🗄️ **Firestore DB**<br/>(Chats, Usuarios, Materiales)")]
    AJ --> AM[("📁 **Storage**<br/>(Fotos, Audio, Galería)")]
    AJ --> AN[("📬 **Cloud Messaging**<br/>(Notificaciones Push)")]

    class AJ,AK,AL,AM,AN data
```

---

## 📋 Resumen del Flujo

1. **Inicio → Login**: El usuario se autentica con email/contraseña o Google.
2. **Chat Principal**: Red social con chat en tiempo real, envío de imágenes, audio y ubicación.
3. **Módulo Proyectos**: Panel central con acceso a todas las herramientas técnicas.
4. **Obras (Cotizador)**: Calcula materiales para ventanas (Sistema, Serie 80, Serie 60) con configuración de puente, cortes, aluminios, vidrios, accesorios y tiras requeridas.
5. **Optimizador de Corte**: Optimiza el corte de planchas de vidrio ingresando piezas y obteniendo la mejor distribución.
6. **Optimizador de Varillas**: Optimiza el corte de perfiles de aluminio a partir de stock y piezas requeridas.
7. **Base de Datos**: CRUD completo de materiales (varillas, planchas, tiras, accesorios) con persistencia en Firebase Firestore.
8. **Firebase**: Backend que soporta autenticación, base de datos en tiempo real, almacenamiento de archivos y notificaciones push.
