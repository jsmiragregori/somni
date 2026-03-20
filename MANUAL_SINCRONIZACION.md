# Manual de Sincronización de Contenidos

Este documento explica cómo usar el sistema de **Fusión Inteligente (Smart Merge)** para cargar obras de arte reales progresivamente en la web.

## 1. Dónde colocar los contenidos
Fuera de la carpeta `Somni Vertical 2`, pero en el mismo directorio principal, debes tener una carpeta llamada `Contenidos_Somni`.

## 2. Nombres de las Galerías (ID_Galería)
La carpeta de cada galería **DEBE** empezar por el *ID de la sala*, seguido de un guión bajo `_`. Todo lo que va después es sólo para ti.

**IDs válidos:** `urban-1`, `urban-2`... `urban-7`, y `indoor-1`, `indoor-2`, `indoor-3`, `indoor-4`.
**Ejemplo:** `urban-1_El_Castell`

## 3. Estructura de cada Obra
Dentro de cada galería (`urban-1_El_Castell`), creas una subcarpeta para cada foto.
**El script ordenará automáticamente las fotos guiándose por tu numeración de carpeta, y asignará la primera (01) como la Obra Destacada (más grande en pantalla).**

```text
urban-1_El_Castell/
├── 01_Fachada_Principal/          <-- Al ser "01_", se mostrará grande (Obra Destacada)
│   ├── mi_foto.jpg                (La imagen, da igual el nombre)
│   ├── desc_es.txt                (Descripción en Castellano)
│   ├── desc_ca.txt                (Descripción en Valenciano)
│   ├── desc_en.txt                (Descripción en Inglés)
│   ├── audio_es.mp3               (Audio en Castellano)
│   ├── audio_ca.mp3               (Audio en Valenciano)
│   ├── audio_en.mp3               (Audio en Inglés)
│   └── year.txt                   (Opcional, indica un año distinto al actual)
├── 02_Detalle_Lateral/            <-- Obra secundaria
└── ...
```

### Reglas simplificadas de archivos:
1. **Imagen y Posición:** Pon los archivos en sus carpetas numeradas. La posición y si es "Destacada" lo define si está en la número 1.
2. **Textos y títulos:** Ya **NO necesitas** proveer un título. El script general el título automáticamente como "Obra 01", "Obra 02" (o "Artwork 01" en inglés). Sólo tienes que generar los textos de descripción (`desc_*/txt`).
3. **Faltan cosas:** Si a una carpeta le falta un audio o una imagen, no pasa nada, el script la insertará usando versiones en caída libre (fallback) para que no crashee la web.

## 4. Ejecutar la Sincronización
Abre una terminal apuntando a tu web (`Somni Vertical 2`) y teclea:

```bash
node syncContent.cjs
```
Listo. Solo sobrescribirá las salas que existan en la carpeta externa respetando en modo "borrador" todas las demás.
