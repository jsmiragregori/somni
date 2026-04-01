# 📚 Manual Maestro de Contenidos: Somni Vertical 2
**Control Total de Visibilidad, Menús y Jerarquía (v3.3)**

Este sistema permite gestionar la exposición mediante una estructura de carpetas y archivos `.txt`. Todo lo que configures aquí se reflejará automáticamente tanto en la página principal como en el **menú hamburguesa**.

---

## 1. Mapa de Archivos para el Menú Alternativo

Para que el menú hamburguesa use un nombre corto, debes poner el archivo en la carpeta correcta:

| Elemento | Ubicación Carpeta | Nombre del Archivo |
| :--- | :--- | :--- |
| **Secciones Principales** (Ej: Urbano, Interior) | `00_Textos_Generales/` | `section_urban_menu_title_es.txt` `section_indoor_menu_title_es.txt` |
| **Salas Individuales** (Ej: Castell, Sala 1) | **Dentro de la propia sala** (Ej: `urban-1_CASTEL/`) | `menu_title_es.txt` |
| **Sección "Autor"** | `00_Textos_Generales/` | Edita `author_texts_es.txt` y pon `menuTitle=Sobre la autora` |

---

## 2. ⚡ Casos Prácticos (Ejemplos Reales)

### Caso A: Cambiar "La Mirada de Maisse" por "Sobre la autora" SOLO en el menú
1. Abre `00_Textos_Generales / author_texts_es.txt`.
2. Añade/Edita la línea: `menuTitle=Sobre la autora`.
3. Guarda y sincroniza.

### Caso B: Un título de sala es muy largo para el menú
1. Ve a la carpeta de la sala (Ej: `Contenidos_Somni / urban-1_SALA_LARGA /`).
2. Crea un archivo nuevo: `menu_title_es.txt`.
3. Escribe dentro el nombre corto (Ej: `Sueño Vertical`).

### Caso C: Acortar el título de la sección de Arte Urbano en el menú
1. Ve a `00_Textos_Generales /`.
2. Crea un archivo: `section_urban_menu_title_es.txt`.
3. Escribe dentro el nombre corto: `Arte Urbano`.

---

## 3. Jerarquía de Visibilidad (Cascada)

Si ocultas un nivel superior, todo lo que hay dentro desaparece automáticamente:

1.  **Nivel 0: Bloques de Página** (Hero, Manifiesto, Galería, Autor, Contacto).
    - Se edita en: `00_Textos_Generales / page_layout.txt`.
2.  **Nivel 1: Secciones de Galería** (Urbano, Interior).
    - Se edita en: `00_Textos_Generales / section_urban_config.txt`.
3.  **Nivel 2: Salas Individuales**.
    - Se edita en: `Cada carpeta de sala / room_config.txt`.

---

## 4. Pasos para Sincronizar (IMPORTANTE)

1.  **Edita** tus archivos `.txt`.
2.  **Guarda** los cambios.
3.  En la terminal, ejecuta:
    ```bash
    node syncContent.cjs
    ```
4.  **Refresca** la web (`F5`).

---

### 💡 Nota sobre Idiomas:
Todos los archivos siguen el mismo patrón: usa `_es` para Castellano, `_ca` para Valenciano y `_en` para Inglés. Por ejemplo: `menu_title_ca.txt` para el menú en valenciano.
