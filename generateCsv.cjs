const fs = require('fs');
const path = require('path');

const URBAN_COUNTS = [3, 5, 7, 8, 10, 12, 16];
const INDOOR_COUNTS = [12, 12, 10, 15];

function generateSpaceIds(spaceIndex, isUrban) {
    const globalSpaceNum = spaceIndex + 1;
    const idPrefix = isUrban ? `urban-${globalSpaceNum}` : `indoor-${globalSpaceNum}`;
    const counts = isUrban ? URBAN_COUNTS : INDOOR_COUNTS;
    const count = counts[spaceIndex];
    
    const photos = [];
    for(let i=1; i<=count; i++) {
        photos.push(`${idPrefix}-photo-${i}`);
    }
    return photos;
}

const allPhotos = [];
for (let i = 0; i < URBAN_COUNTS.length; i++) {
    allPhotos.push(...generateSpaceIds(i, true));
}
for (let i = 0; i < INDOOR_COUNTS.length; i++) {
    allPhotos.push(...generateSpaceIds(i, false));
}

const baseUrl = process.argv[2] || "http://localhost:3002"; 
let csvContent = "espacio,foto_id,url_directa\n";

allPhotos.forEach(id => {
    const parts = id.split('-');
    const spaceName = parts[0] === 'urban' ? `Espacio Urbano ${parts[1]}` : `La Casilla Sala ${parts[1]}`;
    const url = `${baseUrl}/#photo-${id}`;
    csvContent += `"${spaceName}","${id}","${url}"\n`;
});

fs.writeFileSync(path.join(__dirname, 'qrs_directos.csv'), csvContent, 'utf8');
console.log("CSV generated successfully: qrs_directos.csv with " + allPhotos.length + " links pointing to " + baseUrl);
