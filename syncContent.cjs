const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const { marked } = require('marked');

const PROJECT_DIR = __dirname;
// Buscamos la carpeta Contenidos_Somni un nivel por encima del proyecto web
const CONTENT_DIR = path.join(PROJECT_DIR, '..', 'Contenidos_Somni');
const DATA_FILE = path.join(PROJECT_DIR, 'data.js');
const IMG_DEST = path.join(PROJECT_DIR, 'img');
const AUDIO_DEST = path.join(PROJECT_DIR, 'audio');

// ─────────────────────────────────────────────
// Utilidad: parsear archivos clave=valor
// ─────────────────────────────────────────────
function parseKeyValue(filePath) {
    const result = {};
    if (!fs.existsSync(filePath)) return result;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        result[key] = value;
    }
    return result;
}

// ─────────────────────────────────────────────
// Utilidad: parsear page_layout.txt
// Formato: hero,visible=true,order=1
// ─────────────────────────────────────────────
function parsePageLayout(filePath) {
    const result = {};
    if (!fs.existsSync(filePath)) return result;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const parts = trimmed.split(',');
        const id = parts[0].trim();
        const entry = { id };
        for (let i = 1; i < parts.length; i++) {
            const eqIdx = parts[i].indexOf('=');
            if (eqIdx === -1) continue;
            const key = parts[i].slice(0, eqIdx).trim();
            const value = parts[i].slice(eqIdx + 1).trim();
            if (key === 'visible') entry.visible = (value !== 'false');
            if (key === 'order') entry.order = parseInt(value, 10);
        }
        result[id] = entry;
    }
    return result;
}

// 1. Asegurar que las carpetas de destino existen
if (!fs.existsSync(IMG_DEST)) fs.mkdirSync(IMG_DEST);
if (!fs.existsSync(AUDIO_DEST)) fs.mkdirSync(AUDIO_DEST);

// 2. Comprobar que existe la fuente de verdad
if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`ERROR: No se encuentra la carpeta maestra de contenidos: ${CONTENT_DIR}`);
    process.exit(1);
}

// 3. Leer y parsear data.js (Fusión Inteligente)
console.log("Leyendo estructura de data.js...");
let rawData = fs.readFileSync(DATA_FILE, 'utf8');
let jsonString = rawData.replace(/^window\.translations\s*=\s*/, '').trim();
if (jsonString.endsWith(';')) jsonString = jsonString.slice(0, -1);

let data;
try {
    data = new Function('return ' + jsonString)();
} catch (e) {
    console.error("Error parseando data.js", e);
    process.exit(1);
}

// ─────────────────────────────────────────────
// 4. Leer las galerías (rooms — Nivel 2)
// ─────────────────────────────────────────────
const galleryFolders = fs.readdirSync(CONTENT_DIR).filter(f => {
    const full = path.join(CONTENT_DIR, f);
    return fs.statSync(full).isDirectory() && f !== '00_Textos_Generales';
});
let updatedCount = 0;

galleryFolders.forEach(galleryFolder => {
    // Convención: ID_NombreGaleria (ej. urban-1_El_Castell)
    const roomId = galleryFolder.split('_')[0];
    const galleryPath = path.join(CONTENT_DIR, galleryFolder);

    // Verificamos si esta sala existe en data.js
    let roomExists = false;
    for (const lang of ['es', 'ca', 'en']) {
        if (data[lang] && data[lang].rooms.find(r => r.id === roomId)) {
            roomExists = true;
            break;
        }
    }

    if (!roomExists) {
        console.warn(`\n[!] AVISO: El identificador de sala '${roomId}' no existe en data.js. Saltando carpeta...`);
        return;
    }

    console.log(`\nProcesando galería: ${roomId} ...`);

    // --- ROOM CONFIG (visibilidad, orden) ---
    const roomConfig = parseKeyValue(path.join(galleryPath, 'room_config.txt'));

    const photoFolders = fs.readdirSync(galleryPath).filter(f => fs.statSync(path.join(galleryPath, f)).isDirectory());
    photoFolders.sort();

    const newPhotos = { 'es': [], 'ca': [], 'en': [] };

    photoFolders.forEach((photoFolder, pIndex) => {
        const photoPath = path.join(galleryPath, photoFolder);
        const files = fs.readdirSync(photoPath);

        const photoId = `${roomId}-photo-${pIndex + 1}`;

        // --- IMAGEN ---
        const imgFile = files.find(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));
        let imgUrl = `https://picsum.photos/seed/${photoId}/800/600`;
        let orientation = 'landscape';
        if (imgFile) {
            const ext = path.extname(imgFile);
            const newImgName = `${roomId}_photo_${pIndex + 1}${ext}`;
            const sourceImgPath = path.join(photoPath, imgFile);
            fs.copyFileSync(sourceImgPath, path.join(IMG_DEST, newImgName));
            imgUrl = `./img/${newImgName}`;
            try {
                const dimensions = sizeOf(sourceImgPath);
                orientation = (dimensions.width >= dimensions.height) ? 'landscape' : 'portrait';
            } catch (err) {
                console.warn(`    ⚠️ No se pudo leer dimensiones de ${imgFile}, asumiendo landscape.`);
            }
        }

        // --- AUDIO ---
        const getAudioUrl = (lang) => {
            const audioFile = files.find(f => f.match(new RegExp(`audio_${lang}\\.(mp3|wav|ogg|m4a)$`, 'i')));
            if (audioFile) {
                const ext = path.extname(audioFile);
                const newAudioName = `${roomId}_photo_${pIndex + 1}_${lang}${ext}`;
                fs.copyFileSync(path.join(photoPath, audioFile), path.join(AUDIO_DEST, newAudioName));
                return `./audio/${newAudioName}`;
            }
            return null;
        };

        // --- DESCRIPCIONES ---
        const getDesc = (lang) => {
            const txtFile = path.join(photoPath, `desc_${lang}.txt`);
            if (fs.existsSync(txtFile)) return fs.readFileSync(txtFile, 'utf8').trim();
            return `Descripción de la obra pendiente... (${lang})`;
        };

        // --- AÑO ---
        const getYear = () => {
            const txtFile = path.join(photoPath, 'year.txt');
            if (fs.existsSync(txtFile)) return fs.readFileSync(txtFile, 'utf8').trim();
            return new Date().getFullYear().toString();
        };

        const formattedNumber = (pIndex + 1).toString().padStart(2, '0');
        const getTitle = (lang) => {
            if (lang === 'en') return `Artwork ${formattedNumber}`;
            return `Obra ${formattedNumber}`;
        };

        const isMaster = (pIndex === 0);

        for (const lang of ['es', 'ca', 'en']) {
            newPhotos[lang].push({
                id: photoId,
                url: imgUrl,
                orientation: orientation,
                title: getTitle(lang),
                description: getDesc(lang),
                year: getYear(),
                isMasterpiece: isMaster,
                audioUrl: getAudioUrl(lang)
            });
        }
        console.log(`  └─ Agregada foto: ${photoFolder} (Destacada: ${isMaster ? 'Sí' : 'No'})`);
    });

    // --- SMART MERGE (fotos + descripción + título + config) ---
    for (const lang of ['es', 'ca', 'en']) {
        const roomDef = data[lang].rooms.find(r => r.id === roomId);
        if (roomDef) {
            roomDef.photos = newPhotos[lang];

            // Descripción de sala
            const roomDescFile1 = path.join(galleryPath, `desc_room_${lang}.txt`);
            const roomDescFile2 = path.join(galleryPath, `desc_${lang}.txt`);
            if (fs.existsSync(roomDescFile1)) {
                roomDef.description = fs.readFileSync(roomDescFile1, 'utf8').trim();
            } else if (fs.existsSync(roomDescFile2)) {
                roomDef.description = fs.readFileSync(roomDescFile2, 'utf8').trim();
            }

            // ── NUEVO: Título de sala por idioma ──
            const titleFile = path.join(galleryPath, `title_${lang}.txt`);
            if (fs.existsSync(titleFile)) {
                roomDef.title = fs.readFileSync(titleFile, 'utf8').trim();
            }

            // ── NUEVO: Derivar sectionId del prefijo del roomId ──
            const sectionId = roomId.split('-').slice(0, -1).join('-'); // "urban-1" → "urban", "indoor-2" → "indoor"
            roomDef.sectionId = sectionId;

            // ── NUEVO: Visibilidad y orden desde room_config.txt ──
            roomDef.visible = roomConfig.visible !== 'false';
            roomDef.order = roomConfig.order !== undefined ? parseInt(roomConfig.order, 10) : 999;
        }
    }
    updatedCount++;
});

// ─────────────────────────────────────────────
// 5. TEXTOS GENERALES (Nivel 0 y Nivel 1)
// ─────────────────────────────────────────────
const generalTextsDir = path.join(CONTENT_DIR, '00_Textos_Generales');
if (fs.existsSync(generalTextsDir) && fs.statSync(generalTextsDir).isDirectory()) {
    console.log(`\nProcesando textos generales...`);
    let updatedTextsCount = 0;

    for (const lang of ['es', 'ca', 'en']) {
        const checkAndSet = (filename, targetObj, targetProp) => {
            const filePath = path.join(generalTextsDir, filename);
            if (fs.existsSync(filePath)) {
                targetObj[targetProp] = fs.readFileSync(filePath, 'utf8').trim();
                updatedTextsCount++;
            }
        };

        checkAndSet(`manifesto_title_${lang}.txt`, data[lang].manifesto, 'title');
        checkAndSet(`manifesto_${lang}.txt`, data[lang].manifesto, 'text');
        checkAndSet(`pausa1_${lang}.txt`, data[lang].pauses, 'pause1');
        checkAndSet(`pausa2_${lang}.txt`, data[lang].pauses, 'pause2');
        checkAndSet(`bio_${lang}.txt`, data[lang].author, 'bio');
        checkAndSet(`hero_subtitle_${lang}.txt`, data[lang].hero, 'subtitle');

        // Política de privacidad (Markdown → HTML)
        const privacyMdPath = path.join(generalTextsDir, `privacy_${lang}.md`);
        if (fs.existsSync(privacyMdPath)) {
            const mdContent = fs.readFileSync(privacyMdPath, 'utf8').trim();
            if (!data[lang].privacy) data[lang].privacy = {};
            data[lang].privacy.html = marked.parse(mdContent);
            updatedTextsCount++;
            console.log(`  └─ Convertida política de privacidad (${lang}.md) → HTML en data.js`);
        }
    }

    // Imagen bio
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    for (const ext of validExts) {
        const imgName = `bio_image${ext}`;
        const sourceImgPath = path.join(generalTextsDir, imgName);
        if (fs.existsSync(sourceImgPath)) {
            fs.copyFileSync(sourceImgPath, path.join(IMG_DEST, imgName));
            for (const lang of ['es', 'ca', 'en']) {
                data[lang].author.image = `./img/${imgName}`;
            }
            console.log(`  └─ Copiada imagen de la bio: ${imgName}`);
            break;
        }
    }

    // Imagen hero
    for (const ext of validExts) {
        const imgName = `hero_image${ext}`;
        const sourceImgPath = path.join(generalTextsDir, imgName);
        if (fs.existsSync(sourceImgPath)) {
            fs.copyFileSync(sourceImgPath, path.join(IMG_DEST, imgName));
            for (const lang of ['es', 'ca', 'en']) {
                data[lang].hero.image = `./img/${imgName}`;
            }
            console.log(`  └─ Copiada imagen de fondo hero: ${imgName}`);
            break;
        }
    }

    // ── NUEVO: Secciones de Galería (Nivel 1: urban / indoor) ──
    console.log(`\nProcesando secciones de galería (Nivel 1)...`);
    const sectionIds = ['urban', 'indoor'];
    for (const lang of ['es', 'ca', 'en']) {
        if (!data[lang].sections) data[lang].sections = [];

        for (const secId of sectionIds) {
            const secConfig = parseKeyValue(path.join(generalTextsDir, `section_${secId}_config.txt`));
            const titleFile = path.join(generalTextsDir, `section_${secId}_title_${lang}.txt`);

            // Buscar si ya existe la sección en el array
            let secDef = data[lang].sections.find(s => s.id === secId);
            if (!secDef) {
                // Fallback: título desde labels existentes si no hay archivo de título
                const fallbackTitle = data[lang].labels ? data[lang].labels[`${secId}_space`] || secId : secId;
                secDef = { id: secId, title: fallbackTitle, visible: true, order: sectionIds.indexOf(secId) + 1 };
                data[lang].sections.push(secDef);
            }

            // Aplicar título desde archivo si existe
            if (fs.existsSync(titleFile)) {
                secDef.title = fs.readFileSync(titleFile, 'utf8').trim();
            }

            // Aplicar config
            if (secConfig.visible !== undefined) secDef.visible = (secConfig.visible !== 'false');
            if (secConfig.order !== undefined) secDef.order = parseInt(secConfig.order, 10);
        }

        // Ordenar secciones por order
        data[lang].sections.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        console.log(`  └─ Secciones (${lang}): ${data[lang].sections.map(s => `${s.id}(order=${s.order},visible=${s.visible})`).join(', ')}`);
    }

    // ── NUEVO: Secciones de Página (Nivel 0) ──
    console.log(`\nProcesando layout de página (Nivel 0)...`);
    const pageLayoutFile = path.join(generalTextsDir, 'page_layout.txt');
    const pageLayout = parsePageLayout(pageLayoutFile);
    const defaultPageSections = [
        { id: 'hero',      visible: true, order: 1 },
        { id: 'manifesto', visible: true, order: 2 },
        { id: 'gallery',   visible: true, order: 3 },
        { id: 'author',    visible: true, order: 4 },
        { id: 'contact',   visible: true, order: 5 },
    ];

    for (const lang of ['es', 'ca', 'en']) {
        // Construir pageSections fusionando defaults con lo que haya en page_layout.txt
        data[lang].pageSections = defaultPageSections.map(def => {
            const override = pageLayout[def.id] || {};
            return {
                id: def.id,
                visible: override.visible !== undefined ? override.visible : def.visible,
                order: override.order !== undefined ? override.order : def.order,
            };
        });
        // Ordenar por order
        data[lang].pageSections.sort((a, b) => a.order - b.order);
        console.log(`  └─ pageSections (${lang}): ${data[lang].pageSections.map(s => `${s.id}(order=${s.order},visible=${s.visible})`).join(', ')}`);
    }

    // ── NUEVO: Ordenar rooms por sección y por order interno ──
    console.log(`\nOrdenando rooms según sección y order...`);
    for (const lang of ['es', 'ca', 'en']) {
        const sections = data[lang].sections;
        data[lang].rooms.sort((a, b) => {
            const idxA = sections.findIndex(s => s.id === a.sectionId);
            const idxB = sections.findIndex(s => s.id === b.sectionId);
            if (idxA !== idxB) return idxA - idxB;
            return (a.order ?? 999) - (b.order ?? 999);
        });
    }

    if (updatedTextsCount > 0) {
        console.log(`\n  └─ Actualizados ${updatedTextsCount} textos generales en data.js.`);
    }
}

const newContent = `window.translations = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(DATA_FILE, newContent, 'utf8');

console.log(`\n==============================================`);
console.log(`¡Sincronización Completada!`);
console.log(`Se han actualizado las obras de ${updatedCount} espacio(s).`);
console.log(`==============================================\n`);
