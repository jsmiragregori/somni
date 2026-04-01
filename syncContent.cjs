const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const { marked } = require('marked');

const PROJECT_DIR = __dirname;
const CONTENT_DIR = path.join(PROJECT_DIR, '..', 'Contenidos_Somni');
const DATA_FILE = path.join(PROJECT_DIR, 'data.js');
const IMG_DEST = path.join(PROJECT_DIR, 'img');
const AUDIO_DEST = path.join(PROJECT_DIR, 'audio');

// ─────────────────────────────────────────────
// Utilidades
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

// Helper para fusionar objetos de configuración con soporte para booleanos
function mergeConfig(target, config) {
    for (const key in config) {
        const val = config[key];
        if (val === 'true') target[key] = true;
        else if (val === 'false') target[key] = false;
        else target[key] = val;
    }
}

if (!fs.existsSync(IMG_DEST)) fs.mkdirSync(IMG_DEST);
if (!fs.existsSync(AUDIO_DEST)) fs.mkdirSync(AUDIO_DEST);

if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`ERROR: No se encuentra la carpeta maestra de contenidos: ${CONTENT_DIR}`);
    process.exit(1);
}

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
    const roomId = galleryFolder.split('_')[0];
    const galleryPath = path.join(CONTENT_DIR, galleryFolder);

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
    const roomConfig = parseKeyValue(path.join(galleryPath, 'room_config.txt'));

    const photoFolders = fs.readdirSync(galleryPath).filter(f => fs.statSync(path.join(galleryPath, f)).isDirectory());
    photoFolders.sort();

    const newPhotos = { 'es': [], 'ca': [], 'en': [] };

    photoFolders.forEach((photoFolder, pIndex) => {
        const photoPath = path.join(galleryPath, photoFolder);
        const files = fs.readdirSync(photoPath);
        const photoId = `${roomId}-photo-${pIndex + 1}`;

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
            } catch (err) {}
        }

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

        const getDesc = (lang) => {
            const txtFile = path.join(photoPath, `desc_${lang}.txt`);
            if (fs.existsSync(txtFile)) return fs.readFileSync(txtFile, 'utf8').trim();
            return `Descripción pendiente... (${lang})`;
        };

        const getYear = () => {
            const txtFile = path.join(photoPath, 'year.txt');
            if (fs.existsSync(txtFile)) return fs.readFileSync(txtFile, 'utf8').trim();
            return "2024";
        };

        const isMaster = (pIndex === 0);
        for (const lang of ['es', 'ca', 'en']) {
            newPhotos[lang].push({
                id: photoId,
                url: imgUrl,
                orientation: orientation,
                title: `Obra ${(pIndex+1).toString().padStart(2,'0')}`,
                description: getDesc(lang),
                year: getYear(),
                isMasterpiece: isMaster,
                audioUrl: getAudioUrl(lang)
            });
        }
    });

    for (const lang of ['es', 'ca', 'en']) {
        const roomDef = data[lang].rooms.find(r => r.id === roomId);
        if (roomDef) {
            roomDef.photos = newPhotos[lang];
            const roomDescFile1 = path.join(galleryPath, `desc_room_${lang}.txt`);
            const roomDescFile2 = path.join(galleryPath, `desc_${lang}.txt`);
            if (fs.existsSync(roomDescFile1)) roomDef.description = fs.readFileSync(roomDescFile1, 'utf8').trim();
            else if (fs.existsSync(roomDescFile2)) roomDef.description = fs.readFileSync(roomDescFile2, 'utf8').trim();

            const titleFile = path.join(galleryPath, `title_${lang}.txt`);
            if (fs.existsSync(titleFile)) roomDef.title = fs.readFileSync(titleFile, 'utf8').trim();

            // ── NUEVO: Título de menú (opcional) ──
            const menuTitleFile = path.join(galleryPath, `menu_title_${lang}.txt`);
            if (fs.existsSync(menuTitleFile)) roomDef.menuTitle = fs.readFileSync(menuTitleFile, 'utf8').trim();
            else delete roomDef.menuTitle; // Limpiar si no existe

            const sectionId = roomId.split('-').slice(0, -1).join('-');
            roomDef.sectionId = sectionId;
            roomDef.visible = roomConfig.visible !== 'false';
            roomDef.order = roomConfig.order !== undefined ? parseInt(roomConfig.order, 10) : 999;
        }
    }
    updatedCount++;
});

// ─────────────────────────────────────────────
// 5. TEXTOS GENERALES
// ─────────────────────────────────────────────
const generalTextsDir = path.join(CONTENT_DIR, '00_Textos_Generales');
if (fs.existsSync(generalTextsDir)) {
    console.log(`\nProcesando textos generales...`);

    for (const lang of ['es', 'ca', 'en']) {
        // --- Labels y Textos Agrupados ---
        mergeConfig(data[lang].nav, parseKeyValue(path.join(generalTextsDir, `nav_labels_${lang}.txt`)));
        mergeConfig(data[lang].hero, parseKeyValue(path.join(generalTextsDir, `hero_texts_${lang}.txt`)));
        mergeConfig(data[lang].author, parseKeyValue(path.join(generalTextsDir, `author_texts_${lang}.txt`)));
        mergeConfig(data[lang].contact, parseKeyValue(path.join(generalTextsDir, `contact_form_${lang}.txt`)));
        mergeConfig(data[lang].footer, parseKeyValue(path.join(generalTextsDir, `footer_labels_${lang}.txt`)));

        // --- Casos especiales (archivos individuales antiguos) ---
        const checkAndSet = (filename, targetObj, targetProp) => {
            const filePath = path.join(generalTextsDir, filename);
            if (fs.existsSync(filePath)) targetObj[targetProp] = fs.readFileSync(filePath, 'utf8').trim();
        };
        checkAndSet(`manifesto_title_${lang}.txt`, data[lang].manifesto, 'title');
        checkAndSet(`manifesto_${lang}.txt`, data[lang].manifesto, 'text');
        checkAndSet(`pausa1_${lang}.txt`, data[lang].pauses, 'pause1');
        checkAndSet(`pausa2_${lang}.txt`, data[lang].pauses, 'pause2');
        checkAndSet(`pausa_title_${lang}.txt`, data[lang].pauses, 'title');
        checkAndSet(`bio_${lang}.txt`, data[lang].author, 'bio');

        const privacyMdPath = path.join(generalTextsDir, `privacy_${lang}.md`);
        if (fs.existsSync(privacyMdPath)) {
            data[lang].privacy = data[lang].privacy || {};
            data[lang].privacy.html = marked.parse(fs.readFileSync(privacyMdPath, 'utf8').trim());
        }
    }

    // Imágenes
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    for (const ext of validExts) {
        if (fs.existsSync(path.join(generalTextsDir, `bio_image${ext}`))) {
            fs.copyFileSync(path.join(generalTextsDir, `bio_image${ext}`), path.join(IMG_DEST, `bio_image${ext}`));
            ['es','ca','en'].forEach(l => data[l].author.image = `./img/bio_image${ext}`);
            break;
        }
    }
    for (const ext of validExts) {
        if (fs.existsSync(path.join(generalTextsDir, `hero_image${ext}`))) {
            fs.copyFileSync(path.join(generalTextsDir, `hero_image${ext}`), path.join(IMG_DEST, `hero_image${ext}`));
            ['es','ca','en'].forEach(l => data[l].hero.image = `./img/hero_image${ext}`);
            break;
        }
    }

    // Secciones de Galería (Nivel 1)
    const sectionIds = ['urban', 'indoor'];
    for (const lang of ['es', 'ca', 'en']) {
        data[lang].sections = data[lang].sections || [];
        for (const secId of sectionIds) {
            const secConfig = parseKeyValue(path.join(generalTextsDir, `section_${secId}_config.txt`));
            let secDef = data[lang].sections.find(s => s.id === secId);
            if (!secDef) {
                secDef = { id: secId, title: secId, visible: true, order: 999 };
                data[lang].sections.push(secDef);
            }
            const titleFile = path.join(generalTextsDir, `section_${secId}_title_${lang}.txt`);
            if (fs.existsSync(titleFile)) secDef.title = fs.readFileSync(titleFile, 'utf8').trim();
            
            // ── NUEVO: Título de menú para secciones ──
            const menuTitleFile = path.join(generalTextsDir, `section_${secId}_menu_title_${lang}.txt`);
            if (fs.existsSync(menuTitleFile)) secDef.menuTitle = fs.readFileSync(menuTitleFile, 'utf8').trim();
            else delete secDef.menuTitle;

            mergeConfig(secDef, secConfig);
        }
        data[lang].sections.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }

    // Config de Pausas
    const pausesConfig = parseKeyValue(path.join(generalTextsDir, 'pauses_config.txt'));
    for (const lang of ['es', 'ca', 'en']) {
        mergeConfig(data[lang].pauses, pausesConfig);
    }

    // Page Layout (Nivel 0)
    const pageLayoutFile = path.join(generalTextsDir, 'page_layout.txt');
    const pageLayout = parsePageLayout(pageLayoutFile);
    const defaultPageSections = [
        { id: 'hero', visible: true, order: 1 },
        { id: 'manifesto', visible: true, order: 2 },
        { id: 'gallery', visible: true, order: 3 },
        { id: 'author', visible: true, order: 4 },
        { id: 'contact', visible: true, order: 5 },
    ];
    for (const lang of ['es', 'ca', 'en']) {
        data[lang].pageSections = defaultPageSections.map(def => {
            const override = pageLayout[def.id] || {};
            return {
                id: def.id,
                visible: override.visible !== undefined ? override.visible : def.visible,
                order: override.order !== undefined ? override.order : def.order,
            };
        });
        data[lang].pageSections.sort((a, b) => a.order - b.order);
    }

    // Ordenar rooms
    for (const lang of ['es', 'ca', 'en']) {
        const sections = data[lang].sections;
        data[lang].rooms.sort((a, b) => {
            const idxA = sections.findIndex(s => s.id === a.sectionId);
            const idxB = sections.findIndex(s => s.id === b.sectionId);
            if (idxA !== idxB) return idxA - idxB;
            return (a.order ?? 999) - (b.order ?? 999);
        });
    }
}

const newContent = `window.translations = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(DATA_FILE, newContent, 'utf8');

console.log(`\n==============================================`);
console.log(`¡Sincronización Completada!`);
console.log(`Se han actualizado las etiquetas y obras.`);
console.log(`==============================================\n`);
