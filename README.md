# VisuMed - Visualizador de Resonancias Magnéticas

## Descripción General

VisuMed es una aplicación móvil desarrollada con React Native que permite a los pacientes visualizar, interactuar y comprender sus estudios de resonancia magnética cerebral. A diferencia de las aplicaciones médicas profesionales, VisuMed está diseñada específicamente para pacientes, ofreciendo una interfaz intuitiva y herramientas simplificadas que permiten al usuario explorar sus imágenes médicas y consultar con profesionales cuando sea necesario.

## Ecosistema

Esta aplicación móvil es parte del ecosistéma de VisuMed, para ver los demas repositorios accede a las siguientes ligas:
- OrthancDevelopment: https://github.com/AlfredoB14/Orthanc_Pinguland
- Backend: https://github.com/AlfredoB14/Backend_Hackaton
- VisuMedWeb: https://github.com/RedGhost1505/SaludDignaWeb/tree/alex
- VisuMedMobileApp: https://github.com/DavidBo9/VisuMedMobileApp


## Características Principales

### 🧠 Visualización de MRI
- Visualización de resonancias magnéticas cerebrales en formato JPEG
- Interfaz limpia y centrada en la imagen
- Navegación intuitiva entre diferentes tipos de secuencias (eADC, T2 Flair, etc.)

### 🛠️ Herramientas de Análisis
- **Ajuste de Contraste y Brillo**: Permite al usuario optimizar la visualización
- **Zoom**: Acercar y mover la imagen para ver detalles específicos
- **Anotación**: Herramienta para marcar áreas de interés en la imagen
- **Exportación**: Guardar o compartir la imagen con anotaciones
- **Consulta**: Comunicación directa con asistente médico virtual

### 💬 Chat de Asistencia Médica
- Asistente integrado para responder preguntas sobre la resonancia
- Explicaciones sencillas en lenguaje accesible para pacientes
- Base de conocimiento específica para cada tipo de estudio

### 📱 Experiencia de Usuario
- Diseño moderno con navegación intuitiva
- Proceso de onboarding explicativo
- Sección de noticias y actualizaciones médicas

## Tecnologías Utilizadas

- **Framework**: React Native + Expo
- **Navegación**: Expo Router
- **Gestión de Estados**: React Hooks (useState, useRef, useEffect)
- **Animaciones**: React Native Animated API
- **Compartir/Guardar**: Expo MediaLibrary, Expo Sharing
- **Dibujo/Anotaciones**: React Native SVG
- **Captura de Pantalla**: React Native ViewShot
- **Interacción Táctil**: PanResponder

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/visumed.git
cd visumed
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Instalar dependencias específicas para las herramientas:
```bash
npm install @react-native-community/slider expo-file-system expo-media-library expo-sharing react-native-view-shot react-native-svg
# o
yarn add @react-native-community/slider expo-file-system expo-media-library expo-sharing react-native-view-shot react-native-svg
```

4. Iniciar la aplicación:
```bash
npx expo start
```

## Configuración

Para permitir guardar imágenes en la galería, agregar las siguientes permissions en app.json:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos."
        }
      ]
    ]
  }
}
```

## Estructura de Carpetas

```
visumed/
├── app/                   # Rutas de la aplicación
│   ├── _layout.js         # Layout principal
│   ├── index.js           # Pantalla de splash
│   ├── onboarding.js      # Pantalla de onboarding
│   ├── login.js           # Pantalla de login
│   ├── home.js            # Pantalla principal
│   ├── home-news.js       # Noticias y promociones
│   ├── mri-viewer.js      # Visualizador de MRI
│   └── chat.js            # Pantalla de chat
├── assets/                # Imágenes, fuentes, etc.
├── components/            # Componentes reutilizables
│   ├── NewsCard.js
│   ├── FloatingActionButton.js
│   ├── BottomNavigation.js
│   └── ChatMessage.js
└── constants/             # Constantes (colores, etc.)
```

## Uso de las Herramientas

### Ajuste de Contraste
Accede desde el botón flotante (+) y selecciona "Contraste". Utiliza los deslizadores para ajustar el brillo y contraste de la imagen.

### Zoom
Accede desde el botón flotante (+) y selecciona "Zoom". Usa dos dedos para acercar/alejar y un dedo para mover la imagen.

### Anotación
Accede desde el botón flotante (+) y selecciona "Anotar". Elige un color y grosor, luego dibuja directamente sobre la imagen.

### Exportación
Accede desde el botón flotante (+) y selecciona "Exportar". Elige entre compartir o guardar en la galería.

### Consulta
Accede desde el botón flotante (+) y selecciona "Consultar". Utiliza el chat para realizar preguntas sobre tu estudio.

## Contribuir

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu función (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo [licencia aquí] - ver el archivo LICENSE para más detalles.

## Contacto

Para preguntas o sugerencias, contactar a [tu contacto aquí].

---

Desarrollado con ❤️ para pacientes que desean entender mejor sus estudios médicos.
