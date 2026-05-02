# 📚 Manual Maestro de Contenidos: Somni Vertical 2
**Control Total de Visibilidad, Menús y Jerarquía (v3.4)**

Este sistema permite gestionar la exposición mediante una estructura de carpetas y archivos `.txt`. Todo lo que configures aquí se reflejará automáticamente tanto en la página principal como en el **menú hamburguesa**.

---

## 🚀 Guía de Referencia Rápida para tus Secciones Actuales

Usa esta tabla para saber qué archivo crear si quieres un título corto en el menú:

### 1. Secciones Principales (Grupos)
| Si quieres cambiar el menú de... | Debes crear este archivo en `00_Textos_Generales/` |
| :--- | :--- |
| **Arte Urbano** | `section_urban_menu_title_es.txt` |
| **Arte Interior** | `section_indoor_menu_title_es.txt` |
| **La mirada de Maisse** | (Edita la línea `menuTitle` en `author_texts_es.txt`) |

### 2. Salas de Arte Urbano (Nivel 2)
| Sala actual | Carpeta donde iría el archivo `menu_title_es.txt` |
| :--- | :--- |
| **El Castell** | `Contenidos_Somni / urban-1_CASTELL / menu_title_es.txt` |
| **Hispanidad** | `Contenidos_Somni / urban-2_HISPANIDAD / menu_title_es.txt` |
| **El Pontet** | `Contenidos_Somni / urban-3_PONTET / menu_title_es.txt` |
| **Bonavista** | `Contenidos_Somni / urban-4_BONAVISTA / menu_title_es.txt` |
| **Carrascos** | `Contenidos_Somni / urban-5_CARRASCOS / menu_title_es.txt` |
| **Maravall** | `Contenidos_Somni / urban-6_MARAVALL / menu_title_es.txt` |
| **Ametlla del Mar** | `Contenidos_Somni / urban-7_AMETLLA / menu_title_es.txt` |

### 3. Salas de Arte Interior (Nivel 2)
| Sala actual | Carpeta donde iría el archivo `menu_title_es.txt` |
| :--- | :--- |
| **Sala 1** | `Contenidos_Somni / indoor-1_SALA1 / menu_title_es.txt` |
| **Sala 2** | `Contenidos_Somni / indoor-2_SALA2 / menu_title_es.txt` |
| **Sala 3** | `Contenidos_Somni / indoor-3_SALA3 / menu_title_es.txt` |
| **Sala 4** | `Contenidos_Somni / indoor-4_SALA4 / menu_title_es.txt` |

---

## ⚡ Lógica Avanzada de Ingesta (Campos, Visibilidad y Orden)

### 1. Visibilidad y Orden en Cascada
La estructura sigue una jerarquía estricta de 3 niveles:

- **Nivel 0: Bloques principales de la página**
  - Ubicación: `Contenidos_Somni / 00_Textos_Generales / page_layout.txt`
  - Formato por cada línea: `id_de_sección, visible=true/false, order=N`
  - Ejemplo: `manifesto, visible=true, order=2`

- **Nivel 1: Secciones de la Galería (Grupo superior)**
  - Ubicación: `Contenidos_Somni / 00_Textos_Generales / section_urban_config.txt` (y `section_indoor_config.txt`)
  - Formato: `visible=true/false` y `order=N` en líneas separadas.
  - Ejemplo:
    ```text
    visible=true
    order=1
    ```

- **Nivel 2: Salas individuales**
  - Ubicación: En cada carpeta de la sala (Ej: `Contenidos_Somni / urban-1_CASTELL / room_config.txt`)
  - Formato: `visible=true/false` y `order=N` en líneas separadas.
  - Ejemplo:
    ```text
    visible=true
    order=10
    ```

### 2. Formato enriquecido con HTML
En todos los textos planos que se inyectan en la web (como `bio_es.txt`, `manifesto_es.txt`, descripciones de salas `desc_es.txt`, o de fotos `desc_es.txt`) se pueden emplear etiquetas HTML estándar para dar formato al contenido:
- **Negritas**: `<b>texto destacado</b>` o `<strong>texto destacado</strong>`
- **Cursivas**: `<i>texto en cursiva</i>` o `<em>texto en cursiva</em>`
- **Saltos de línea**: `<br>` o `<br><br>` para separar párrafos.

### 3. Redes Sociales en el Pie de Página
Los enlaces en el footer se configuran en el archivo:
- `Contenidos_Somni / 00_Textos_Generales / socials_config.txt`
- Para **desactivar** por completo las redes del footer: pon `visible=false` en el archivo.
- Para **activar** las redes: pon `visible=true`.

---

## ⚡ Lógica de Funcionamiento (Recuérdalo)

1.  **Título de Página:** Se lee de `title_es.txt` (o del nombre de la carpeta). Es el que ves en grande al hacer scroll.
2.  **Título de Menú:** Se lee de `menu_title_es.txt`. Si este archivo NO existe, el menú usa automáticamente el de la página.
    - *Úsalo solo si el título de la página es demasiado largo para el menú de móvil.*
3.  **Biografía del Autor:** Se lee del archivo `Contenidos_Somni / 00_Textos_Generales / bio_es.txt`.

---

## 🟢 Pasos para Sincronizar

1.  **Crea o Edita** tus archivos `.txt` en la carpeta que corresponda (mira las tablas de arriba).
2.  **Guarda** los cambios.
3.  En la terminal, ejecuta:
    ```bash
    node syncContent.cjs
    ```
4.  **Refresca** la web (`F5`).

---

### 💡 Ejemplo Maestro:
Imagina que la sala **urban-7** se llama *"Ametlla del Mar: Un paseo por la costa"* (demasiado largo).
- En la web se verá el nombre completo.
- Creas `Contenidos_Somni / urban-7_AMETLLA / menu_title_es.txt` y dentro escribes: `Ametlla`.
- ¡Listo! En el menú ahora solo pondrá `Ametlla`, mucho más limpio.
