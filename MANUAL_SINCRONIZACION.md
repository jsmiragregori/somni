# Manual de Sincronización de Contenidos

Este documento explica cómo usar el sistema de **Fusión Inteligente (Smart Merge)** para cargar obras de arte reales progresivamente en la web.

## 1. Dónde colocar los contenidos
Fuera de la carpeta `Somni Vertical 2`, pero en el mismo directorio principal, debes tener una carpeta llamada `Contenidos_Somni`.

## 2. Nombres de las Galerías (ID_Galería)
La carpeta de cada galería **DEBE** empezar por el *ID de la sala*, seguido de un guión bajo `_`. Todo lo que va después es sólo para ti.

**IDs válidos:** `urban-1`, `urban-2`... `urban-7`, y `indoor-1`, `indoor-2`, `indoor-3`, `indoor-4`.
**Ejemplo:** `urban-1_El_Castell`

## 3. Textos Generales de la Web (Opcional)
Para cambiar textos fijos como el Manifiesto, los momentos de reflexión o la biografía del autor, debes crear una carpeta específica llamada `00_Textos_Generales` dentro de `Contenidos_Somni/`. Al ejecutarse el script, si encuentra esta carpeta y sus respectivos archivos de texto, actualizará los textos base de la web.

Los archivos que acepta esta carpeta son (reemplazar `_es` por `_ca` o `_en` según idioma):
- `manifesto_title_es.txt`: Título del manifiesto ("El instante suspendido")
- `manifesto_es.txt`: Texto principal del manifiesto.
- `pausa1_es.txt`: Primer momento de reflexión ("Observa el vacío...").
- `pausa2_es.txt`: Segundo momento de reflexión ("La naturaleza no se apresura...").
- `bio_es.txt`: Texto de perfil de la autora ("Soy Maria José Lozano...").
- `bio_image.jpg` (o `.png`, `.webp`): Imagen circular de la autora. Recomendado formato cuadrado (1:1).

## 4. Estructura de cada Obra
Dentro de cada galería (`urban-1_El_Castell`), creas una subcarpeta para cada foto.
**El script ordenará automáticamente las fotos guiándose por tu numeración de carpeta, y asignará la primera (01) como la Obra Destacada (más grande en pantalla).**

```text
urban-1_El_Castell/
├── desc_room_es.txt               (OPCIONAL: Descripción general de la SALA en Castellano)
├── desc_room_ca.txt               (OPCIONAL: Descripción general de la SALA en Valenciano)
├── desc_room_en.txt               (OPCIONAL: Descripción general de la SALA en Inglés)
├── 01_Fachada_Principal/          <-- Al ser "01_", se mostrará grande (Obra Destacada)
│   ├── mi_foto.jpg                (La imagen, da igual el nombre)
│   ├── desc_es.txt                (Descripción del CUADRO/FOTO en Castellano)
│   ├── desc_ca.txt                (Descripción del CUADRO/FOTO en Valenciano)
│   ├── desc_en.txt                (Descripción del CUADRO/FOTO en Inglés)
│   ├── audio_es.mp3               (Audio en Castellano)
│   ├── audio_ca.mp3               (Audio en Valenciano)
│   ├── audio_en.mp3               (Audio en Inglés)
│   └── year.txt                   (Opcional, indica un año distinto al actual)
├── 02_Detalle_Lateral/            <-- Obra secundaria
└── ...
```

### Reglas simplificadas de archivos:
1. **Introducción de la Sala Completa (NOVEDAD):** Para el texto que presenta toda la sala, guarda en la *raíz* de la galería los archivos `desc_room_es.txt`, `desc_room_ca.txt` y `desc_room_en.txt`. Su texto se convertirá en la introducción general de ese espacio de arte completo. **Nota:** Fíjate que a estos archivos se les añade "room_" al nombre para que no se confundan con los de las fotos.
2. **Imagen y Posición:** Pon los archivos en sus carpetas numeradas. La posición y si es "Destacada" lo define si está en la número 1.
3. **Textos y títulos de las Fotos:** Dentro de cada carpeta, pon su texto asociado (que deberá llamarse `desc_es.txt`, `desc_ca.txt` y `desc_en.txt`). Ya **NO necesitas** proveer un título. El script genera el título automáticamente como "Obra 01", "Obra 02" (o "Artwork 01" en inglés).
3. **Faltan cosas:** Si a una carpeta le falta un audio o una imagen, no pasa nada, el script la insertará usando versiones en caída libre (fallback) para que no crashee la web.

## 5. Ejecutar la Sincronización
Abre una terminal apuntando a tu web (`Somni Vertical 2`) y teclea:

```bash
node syncContent.cjs
```
Listo. Solo sobrescribirá las salas que existan en la carpeta externa respetando en modo "borrador" todas las demás.
