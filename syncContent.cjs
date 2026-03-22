const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const PROJECT_DIR = __dirname;
// Buscamos la carpeta Contenidos_Somni un nivel por encima del proyecto web
const CONTENT_DIR = path.join(PROJECT_DIR, '..', 'Contenidos_Somni');
const DATA_FILE = path.join(PROJECT_DIR, 'data.js');
const IMG_DEST = path.join(PROJECT_DIR, 'img');
const AUDIO_DEST = path.join(PROJECT_DIR, 'audio');

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

// 4. Leer las galerías
const galleryFolders = fs.readdirSync(CONTENT_DIR).filter(f => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory());
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
    
    const photoFolders = fs.readdirSync(galleryPath).filter(f => fs.statSync(path.join(galleryPath, f)).isDirectory());
    // Mantenemos orden para asegurar que 01_ va antes que 02_ de forma consistente
    photoFolders.sort();
    
    const newPhotos = { 'es': [], 'ca': [], 'en': [] };
    
    photoFolders.forEach((photoFolder, pIndex) => {
        const photoPath = path.join(galleryPath, photoFolder);
        const files = fs.readdirSync(photoPath);
        
        const photoId = `${roomId}-photo-${pIndex + 1}`;
        
        // --- IMAGEN ---
        const imgFile = files.find(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));
        let imgUrl = `https://picsum.photos/seed/${photoId}/800/600`; // Fallback PoC
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

        // --- METADATOS COMPLEMENTARIOS ---
        const getYear = () => {
            const txtFile = path.join(photoPath, 'year.txt');
            if (fs.existsSync(txtFile)) return fs.readFileSync(txtFile, 'utf8').trim();
            return new Date().getFullYear().toString();
        };

        // El título no se exige, se genera automáticamente basado en el índice
        const formattedNumber = (pIndex + 1).toString().padStart(2, '0');
        const getTitle = (lang) => {
            if (lang === 'en') return `Artwork ${formattedNumber}`;
            return `Obra ${formattedNumber}`;
        };

        // La primera obra de la galería (pIndex 0) siempre es la Obra Destacada
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

    // --- SMART MERGE ---
    for (const lang of ['es', 'ca', 'en']) {
        const roomDef = data[lang].rooms.find(r => r.id === roomId);
        if (roomDef) {
            roomDef.photos = newPhotos[lang];
            
            // --- ACTUALIZACIÓN DE DESCRIPCIÓN DE LA SALA ---
            const roomDescFile1 = path.join(galleryPath, `desc_room_${lang}.txt`);
            const roomDescFile2 = path.join(galleryPath, `desc_${lang}.txt`);
            
            if (fs.existsSync(roomDescFile1)) {
                roomDef.description = fs.readFileSync(roomDescFile1, 'utf8').trim();
            } else if (fs.existsSync(roomDescFile2)) {
                roomDef.description = fs.readFileSync(roomDescFile2, 'utf8').trim();
            }
        }
    }
    updatedCount++;
});

// --- TEXTOS GENERALES ---
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
        checkAndSet(`bio_${lang}.txt`, data[lang].contact, 'bio');
    }
    
    if (updatedTextsCount > 0) {
        console.log(`  └─ Actualizados ${updatedTextsCount} textos generales en data.js.`);
    } else {
        console.log(`  └─ No se encontraron nuevos archivos de texto general para actualizar.`);
    }
}

const newContent = `window.translations = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(DATA_FILE, newContent, 'utf8');

console.log(`\n==============================================`);
console.log(`¡Sincronización Completada!`);
console.log(`Se han actualizado las obras de ${updatedCount} espacio(s).`);
console.log(`==============================================\n`);
