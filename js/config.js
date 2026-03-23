/* ============================================
   FIVEM SPATIAL LANDING — CONFIGURATION
   ============================================
   
   ¡AJUSTA TODAS LAS COORDENADAS AQUÍ!
   
   El canvas usa DIMENSIONES FIJAS en píxeles (3840 × 6720px)
   para que la ruta GPS y las secciones se vean igual en
   cualquier pantalla.
   
   Secciones: x, y en porcentaje del canvas (0-100%)
   Ruta GPS: coordenadas del viewBox SVG (0-2000, 0-3500)
   
   Para activar el MODO EDITOR y ajustar visualmente:
   Abre la consola del navegador (F12) y escribe:
   
       toggleEditor()
   
   En el editor puedes:
   - Arrastrar puntos ROJOS para mover secciones
   - Arrastrar puntos AZULES para mover waypoints de la ruta GPS
   - Arrastrar puntos VERDES (handles de curva) para controlar la curvatura
   - Clic en "AÑADIR PUNTO" para insertar nuevos waypoints
   - Clic derecho en un punto AZUL para eliminarlo
   - Ajustar la tensión global con el slider
   
   ============================================ */

const CONFIG = {

  // ---- DIMENSIONES DEL CANVAS (píxeles fijos) ----
  // Usar px fijos garantiza que la ruta y el mapa
  // mantengan la misma proporción en cualquier pantalla
  canvasWidth: '3840px',
  canvasHeight: '6720px',

  // ---- INTEGRACIÓN FIVEM (Live Stats) ----
  // Pon aquí el código CFX de tu servidor (ej: 'q98vxe')
  // Se usa para obtener los jugadores en vivo desde la API oficial de FiveM.
  fivemCfxCode: '4o45d8',
  // Máximo de jugadores a mostrar si la API falla o como base.
  fivemMaxPlayers: 128,

  // ---- POSICIONES DE LAS SECCIONES ----
  // { x, y } en porcentaje del canvas
  sections: [
    {
      id: 'sec-welcome',
      label: 'BIENVENIDA',
      num: '01',
      x: 25,
      y: 5,
    },
    {
      id: 'sec-values',
      label: 'NUESTRA FILOSOFÍA',
      num: '02',
      x: 55,
      y: 25,
    },
    {
      id: 'sec-streamers',
      label: 'NUESTROS STREAMERS',
      num: '03',
      x: 30,
      y: 48,
    },
    {
      id: 'sec-staff',
      label: 'NUESTRO STAFF',
      num: '04',
      x: 15,
      y: 68,
    },
    {
      id: 'sec-join',
      label: 'INICIA TU VISADO',
      num: '05',
      x: 20,
      y: 88,
    },
  ],

  // ---- RUTA GPS (SVG Path) ----
  // El viewBox del SVG es 2000 x 3500 (proporcional al canvas)
  //
  // Cada punto: [x, y, tension]
  //   x, y    = coordenadas en el viewBox SVG (0-2000, 0-3500)
  //   tension = curvatura en ese punto (0 = línea recta, 1 = curva máxima)
  //             Por defecto: 0.4
  //
  gpsRoute: {
    viewBox: '0 0 2000 3500',
    points: [
      [550, 230, 0.4],     // Punto 0: Paleto Bay (inicio)
      [600, 500, 0.4],     // Punto 1: Curva hacia abajo
      [900, 750, 0.4],     // Punto 2: Giro hacia Sandy Shores
      [1200, 950, 0.4],    // Punto 3: Sandy Shores
      [1100, 1300, 0.4],   // Punto 4: Bajada
      [800, 1600, 0.4],    // Punto 5: Vinewood
      [600, 1900, 0.4],    // Punto 6: Curva hacia Mission Row
      [450, 2300, 0.4],    // Punto 7: Mission Row
      [500, 2700, 0.4],    // Punto 8: Bajada al aeropuerto
      [550, 3100, 0.4],    // Punto 9: LSIA Airport (fin)
    ],
  },

  // ---- CÁMARA ----
  cameraOffsetX: 0.15,
  cameraOffsetY: 0.20,

  // ---- ANIMACIONES ----
  scrollScrub: 1.2,
  cameraEase: 'power2.inOut',
  cardStagger: 0.1,
  cardDuration: 0.5,
};
