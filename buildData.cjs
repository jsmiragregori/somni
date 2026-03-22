const fs = require('fs');
const path = require('path');

const URBAN_COUNTS = [3, 5, 7, 8, 10, 12, 16];
const INDOOR_COUNTS = [12, 12, 10, 15]; // 4 sub-spaces inside La Casilla

function getLangSpecificAudio(photoId, lang) {
    if (lang === 'en') return `/audio/foto-${photoId}-en.mp3`;
    if (lang === 'ca') return `/audio/foto-${photoId}-ca.mp3`;
    return `/audio/foto-${photoId}-es.mp3`; // default es
}

function generateLorem(lang) {
    if (lang === 'en') return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";
    if (lang === 'ca') return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore ràpid.";
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore y dolor.";
}

function generateSpace(spaceIndex, isUrban, lang) {
    const isES = lang === 'es';
    const isCA = lang === 'ca';
    
    let title, subtitle, description, idPrefix;
    let counts = isUrban ? URBAN_COUNTS : INDOOR_COUNTS;
    const count = counts[spaceIndex];
    const globalSpaceNum = spaceIndex + 1;

    if (isUrban) {
        idPrefix = `urban-${globalSpaceNum}`;
        title = isES ? `Espacio Urbano ${globalSpaceNum}` : (isCA ? `Espai Urbà ${globalSpaceNum}` : `Urban Space ${globalSpaceNum}`);
        subtitle = isES ? `Intervención en la ciudad` : (isCA ? `Intervenció a la ciutat` : `City intervention`);
        description = isES ? `Una colección de fotografías integradas en el entorno arquitectónico de Benidorm.` : 
                      (isCA ? `Una col·lecció de fotografies integrades en l'entorn arquitectònic de Benidorm.` : 
                              `A collection of photographs integrated into the architectural environment of Benidorm.`);
    } else {
        idPrefix = `indoor-${globalSpaceNum}`;
        title = isES ? `La Casilla - Sala ${globalSpaceNum}` : (isCA ? `La Casilla - Sala ${globalSpaceNum}` : `La Casilla - Room ${globalSpaceNum}`);
        subtitle = isES ? `Exposición Interior` : (isCA ? `Exposició Interior` : `Indoor Exhibition`);
        description = isES ? `Subespacio interior enfocado en el detalle y la intimidad de la obra.` : 
                      (isCA ? `Subespai interior enfocat en el detall i la intimitat de l'obra.` : 
                              `Indoor subspace focused on the detail and intimacy of the work.`);
    }

    const photos = [];
    for(let i=1; i<=count; i++) {
        const pId = `${idPrefix}-photo-${i}`;
        photos.push({
            id: pId,
            url: `https://picsum.photos/seed/${pId}/800/600`,
            title: isES ? `Obra ${pId}` : (isCA ? `Obra ${pId}` : `Artwork ${pId}`),
            description: generateLorem(lang),
            year: "2024",
            isMasterpiece: i % 5 === 0, // Every 5th photo is a masterpiece
            audioUrl: getLangSpecificAudio(pId, lang) // Using proper naming convention
        });
    }

    return {
        id: idPrefix,
        title,
        subtitle,
        description,
        photos
    };
}

function generateRoomsForLang(lang) {
    const rooms = [];
    
    // Urban spaces
    for (let i = 0; i < URBAN_COUNTS.length; i++) {
        rooms.push(generateSpace(i, true, lang));
    }

    // Indoor spaces (La Casilla)
    for (let i = 0; i < INDOOR_COUNTS.length; i++) {
        rooms.push(generateSpace(i, false, lang));
    }

    return rooms;
}

const data = {
    es: generateRoomsForLang('es'),
    ca: generateRoomsForLang('ca'),
    en: generateRoomsForLang('en')
};

const translations = {
  es: {
    nav: {
      galeria: 'La Galería',
      manifiesto: 'Manifiesto',
      contacto: 'Contacto',
      lang_es: 'ES',
      lang_ca: 'VAL',
      lang_en: 'EN',
      audioguia: 'Audioguía'
    },
    hero: {
      title: 'Somni Vertical',
      subtitle: 'Una exploración fotográfica de la suspensión temporal',
      scroll: 'Desliza para Adentrarte'
    },
    manifesto: {
      title: "El Instante Suspendido",
      text: "Vivimos en la tiranía de la inmediatez. Esta exposición es un acto de rebeldía: una invitación a detenernos. A través de la lente, transformamos lo efímero en eterno, buscando el núcleo emocional puro en el caos de la vida moderna. Respira. Estás a punto de adentrarte en el instante suspendido.",
      label: "Manifiesto"
    },
    pauses: {
      pause1: "Observa el vacío, no como ausencia, sino como el lienzo donde ocurre la vida.",
      pause2: "La naturaleza no se apresura, y sin embargo, todo se logra.",
      title: "Un momento de reflexión"
    },
    rooms: data.es,
    author: {
      name: "Maisse",
      title: "La Mirada de Maisse",
      bio: "Soy Maria José Lozano. Para mí, Benidorm no es solo una ciudad de rascacielos; es mi casa y el lugar donde he aprendido a mirar el cielo con fascinación. Soy docente y una mente inquieta, y la fotografía es mi lenguaje para celebrar la vida. Lo que empezó como una pasión me ha llevado a ganar un Premio Sony World Photography y a ver mis imágenes en revistas de Nueva York, pero mi mayor ilusión es compartir hoy esta mirada contigo."
    },
    contact: {
      label: "Consultas",
      title: "Conectemos",
      description: "Para colaboraciones, visitas privadas o diálogo artístico.",
      button: "Enviar un Mensaje",
      aria_button: "Enviar un Mensaje a la Galería"
    },
    footer: {
      copy: "© 2026 Maisse - Somni Vertical",
      designed: "Diseñado para el Alma"
    }
  },
  ca: {
    nav: {
      galeria: 'La Galeria',
      manifiesto: 'Manifest',
      contacto: 'Contacte',
      lang_es: 'ES',
      lang_ca: 'VAL',
      lang_en: 'EN',
      audioguia: 'Audioguia'
    },
    hero: {
      title: 'Somni Vertical',
      subtitle: 'Una exploració fotogràfica de la suspensió temporal',
      scroll: 'Desplaça per Endinsar-te'
    },
    manifesto: {
      title: "L'Instant Suspés",
      text: "Vivim en la tirania de la immediatesa. Aquesta exposició és un acte de rebel·lia: una invitació a detindre'ns. A través de la lent, transformem l'efímer en etern, buscant el nucli emocional pur en el caos de la vida moderna. Respira. Estàs a punt d'endinsar-te en l'instant suspés.",
      label: "Manifest"
    },
    pauses: {
      pause1: "Observa el buit, no com absència, sinó com el llenç on ocorre la vida.",
      pause2: "La naturalesa no s'apressa, i no obstant això, tot s'aconseguix."
    },
    rooms: data.ca,
    author: {
      name: "Maisse",
      title: "La Mirada de Maisse",
      bio: "Sóc Maria José Lozano. Per a mi, Benidorm no és només una ciutat de gratacels; és casa meua i el lloc on he après a mirar el cel amb fascinació. Soc docent i una ment inquieta, i la fotografia és el meu llenguatge per a celebrar la vida. El que va començar com una passió m'ha portat a guanyar un Premi Sony World Photography i a veure les meues imatges en revistes de Nova York, però la meua major il·lusió és compartir avui aquesta mirada amb tu."
    },
    contact: {
      label: "Consultes",
      title: "Connectem",
      description: "Per a col·laboracions, visites privades o diàleg artístic.",
      button: "Enviar un Missatge",
      aria_button: "Enviar un Missatge a la Galeria"
    },
    footer: {
      copy: "© 2026 Maisse - Somni Vertical",
      designed: "Dissenyat per a l'Ànima"
    }
  },
  en: {
    nav: {
      galeria: 'The Gallery',
      manifiesto: 'Manifesto',
      contacto: 'Contact',
      lang_es: 'ES',
      lang_ca: 'VAL',
      lang_en: 'EN',
      audioguia: 'Audio Guide'
    },
    hero: {
      title: 'Somni Vertical',
      subtitle: 'A photographic exploration of temporal suspension',
      scroll: 'Scroll to Immerse'
    },
    manifesto: {
      title: "The Suspended Instant",
      text: "We live in the tyranny of immediacy. This exhibition is an act of rebellion: an invitation to stop. Through the lens, we transform the ephemeral into the eternal, seeking the pure emotional core in the chaos of modern life. Breathe. You are about to enter the suspended instant.",
      label: "Manifesto"
    },
    pauses: {
      pause1: "Observe the void, not as absence, but as the canvas where life occurs.",
      pause2: "Nature does not hurry, yet everything is accomplished.",
      title: "A moment of reflection"
    },
    rooms: data.en,
    author: {
      name: "Maisse",
      title: "Maisse's Gaze",
      bio: "I am Maria José Lozano. To me, Benidorm is not just a city of skyscrapers; it is my home and the place where I learned to look at the sky with fascination. I am a teacher and a restless mind, and photography is my language to celebrate life. What began as a passion led me to win a Sony World Photography Award and to see my images in New York magazines, but my greatest joy is sharing this vision with you today."
    },
    contact: {
      label: "Inquiries",
      title: "Let's Connect",
      description: "For collaborations, private viewings, or artistic dialogue.",
      button: "Send a Message",
      aria_button: "Send a Message to the Gallery"
    },
    footer: {
      copy: "© 2026 Maisse - Somni Vertical",
      designed: "Designed for the Soul"
    }
  }
};

const jsContent = 'const translations = ' + JSON.stringify(translations, null, 2) + ';\nwindow.translations = translations;';

fs.writeFileSync(path.join(__dirname, 'data.js'), jsContent, 'utf8');
console.log('Successfully generated data.js');
