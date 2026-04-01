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

## ⚡ Lógica de Funcionamiento (Recuérdalo)

1.  **Título de Página:** Se lee de `title_es.txt` (o del nombre de la carpeta). Es el que ves en grande al hacer scroll.
2.  **Título de Menú:** Se lee de `menu_title_es.txt`. Si este archivo NO existe, el menú usa automáticamente el de la página.
    - *Úsalo solo si el título de la página es demasiado largo para el menú de móvil.*

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
