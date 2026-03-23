const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

// New tags to add (zone types and activity types from albionfree builds)
const newTags = {
    // Zone types
    'black_zone': 'Black Zone',
    'blue_zone': 'Blue Zone',
    'red_zone': 'Red Zone',
    'yellow_zone': 'Yellow Zone',
    'orange_zone': 'Orange Zone',
    'open_world': 'Open World',
    
    // Dungeon/Area types
    'arena': 'Arena',
    'ava-dungeon': 'Ava Dungeon',
    'corrupted-dungeon': 'Corrupted Dungeon',
    'crystal_league': 'Crystal League',
    'depths': 'Depths',
    'hellgate': 'Hellgate',
    'knightfall_abbey': 'Knightfall Abbey',
    'mists': 'Mists',
    'roads_avalon': 'Roads of Avalon',
    'solo-dungeon': 'Solo Dungeon',
    'static-dungeon': 'Static Dungeon',
    'territory': 'Territory',
    
    // Activities
    'crafting': 'Crafting',
    'exploration': 'Exploration',
    'faction_warfare': 'Faction Warfare',
    'fame_silver_farm': 'Fame/Silver Farm',
    'gathering': 'Gathering',
    'ganking': 'Ganking',
    'pvp': 'PvP',
    'ratting': 'Ratting',
    'tracking': 'Tracking',
    'transporting': 'Transporting'
};

// Translations for each language
const translations = {
    'de': {
        'black_zone': 'Schwarze Zone',
        'blue_zone': 'Blaue Zone',
        'red_zone': 'Rote Zone',
        'yellow_zone': 'Gelbe Zone',
        'orange_zone': 'Orange Zone',
        'open_world': 'Offene Welt',
        'arena': 'Arena',
        'ava-dungeon': 'Ava Dungeon',
        'corrupted-dungeon': 'Verderbtes Dungeon',
        'crystal_league': 'Kristall-Liga',
        'depths': 'Tiefen',
        'hellgate': 'Höllentor',
        'knightfall_abbey': 'Knightfall Abtei',
        'mists': 'Nebel',
        'roads_avalon': 'Straßen von Avalon',
        'solo-dungeon': 'Solo Dungeon',
        'static-dungeon': 'Static Dungeon',
        'territory': 'Territorium',
        'crafting': 'Handwerk',
        'exploration': 'Erkundung',
        'faction_warfare': 'Fraktionskrieg',
        'fame_silver_farm': 'Ruhm/Silber Farm',
        'gathering': 'Sammeln',
        'ganking': 'Ganking',
        'pvp': 'PvP',
        'ratting': 'Ratting',
        'tracking': 'Verfolgung',
        'transporting': 'Transport'
    },
    'es': {
        'black_zone': 'Zona Negra',
        'blue_zone': 'Zona Azul',
        'red_zone': 'Zona Roja',
        'yellow_zone': 'Zona Amarilla',
        'orange_zone': 'Zona Naranja',
        'open_world': 'Mundo Abierto',
        'arena': 'Arena',
        'ava-dungeon': 'Mazmorra Ava',
        'corrupted-dungeon': 'Mazmorra Corrupta',
        'crystal_league': 'Liga de Cristal',
        'depths': 'Profundidades',
        'hellgate': 'Puerta Infernal',
        'knightfall_abbey': 'Abadía Knightfall',
        'mists': 'Nieblas',
        'roads_avalon': 'Caminos de Avalon',
        'solo-dungeon': 'Mazmorra en Solitario',
        'static-dungeon': 'Mazmorra Estática',
        'territory': 'Territorio',
        'crafting': 'Artesanía',
        'exploration': 'Exploración',
        'faction_warfare': 'Guerra de Facciones',
        'fame_silver_farm': 'Farm de Fama/Plata',
        'gathering': 'Recolección',
        'ganking': 'Ganking',
        'pvp': 'JcJ',
        'ratting': 'Ratting',
        'tracking': 'Rastreo',
        'transporting': 'Transporte'
    },
    'fr': {
        'black_zone': 'Zone Noire',
        'blue_zone': 'Zone Bleue',
        'red_zone': 'Zone Rouge',
        'yellow_zone': 'Zone Jaune',
        'orange_zone': 'Zone Orange',
        'open_world': 'Monde Ouvert',
        'arena': 'Arène',
        'ava-dungeon': 'Donjon Ava',
        'corrupted-dungeon': 'Donjon Corrompu',
        'crystal_league': 'Ligue de Cristal',
        'depths': 'Profondeurs',
        'hellgate': 'Porte des Enfers',
        'knightfall_abbey': 'Abbaye Knightfall',
        'mists': 'Brumes',
        'roads_avalon': 'Routes d\'Avalon',
        'solo-dungeon': 'Donjon Solo',
        'static-dungeon': 'Donjon Statique',
        'territory': 'Territoire',
        'crafting': 'Artisanat',
        'exploration': 'Exploration',
        'faction_warfare': 'Guerre de Factions',
        'fame_silver_farm': 'Farm de Gloire/Argent',
        'gathering': 'Récolte',
        'ganking': 'Ganking',
        'pvp': 'JcJ',
        'ratting': 'Ratting',
        'tracking': 'Pistage',
        'transporting': 'Transport'
    },
    'pt': {
        'black_zone': 'Zona Negra',
        'blue_zone': 'Zona Azul',
        'red_zone': 'Zona Vermelha',
        'yellow_zone': 'Zona Amarela',
        'orange_zone': 'Zona Laranja',
        'open_world': 'Mundo Aberto',
        'arena': 'Arena',
        'ava-dungeon': 'Masmorra Ava',
        'corrupted-dungeon': 'Masmorra Corrompida',
        'crystal_league': 'Liga de Cristal',
        'depths': 'Profundezas',
        'hellgate': 'Portão Infernal',
        'knightfall_abbey': 'Abadia Knightfall',
        'mists': 'Brumas',
        'roads_avalon': 'Estradas de Avalon',
        'solo-dungeon': 'Masmorra Solo',
        'static-dungeon': 'Masmorra Estática',
        'territory': 'Território',
        'crafting': 'Artesanato',
        'exploration': 'Exploração',
        'faction_warfare': 'Guerra de Facções',
        'fame_silver_farm': 'Farm de Fama/Prata',
        'gathering': 'Coleta',
        'ganking': 'Ganking',
        'pvp': 'JvJ',
        'ratting': 'Ratting',
        'tracking': 'Rastreamento',
        'transporting': 'Transporte'
    },
    'ru': {
        'black_zone': 'Черная зона',
        'blue_zone': 'Синяя зона',
        'red_zone': 'Красная зона',
        'yellow_zone': 'Желтая зона',
        'orange_zone': 'Оранжевая зона',
        'open_world': 'Открытый мир',
        'arena': 'Арена',
        'ava-dungeon': 'Подземелье Ава',
        'corrupted-dungeon': 'Оскверненное подземелье',
        'crystal_league': 'Хрустальная лига',
        'depths': 'Глубины',
        'hellgate': 'Врата ада',
        'knightfall_abbey': 'Аббатство Найтфолл',
        'mists': 'Туманы',
        'roads_avalon': 'Дороги Авалона',
        'solo-dungeon': 'Соло подземелье',
        'static-dungeon': 'Статичное подземелье',
        'territory': 'Территория',
        'crafting': 'Ремесло',
        'exploration': 'Исследование',
        'faction_warfare': 'Война фракций',
        'fame_silver_farm': 'Фарм славы/серебра',
        'gathering': 'Сбор',
        'ganking': 'Ганк',
        'pvp': 'PvP',
        'ratting': 'Раттинг',
        'tracking': 'Отслеживание',
        'transporting': 'Транспортировка'
    },
    'ko': {
        'black_zone': '블랙 존',
        'blue_zone': '블루 존',
        'red_zone': '레드 존',
        'yellow_zone': '옐로우 존',
        'orange_zone': '오렌지 존',
        'open_world': '오픈 월드',
        'arena': '아레나',
        'ava-dungeon': '아바 던전',
        'corrupted-dungeon': '타락한 던전',
        'crystal_league': '수정 리그',
        'depths': '심연',
        'hellgate': '지옥문',
        'knightfall_abbey': '나이트폴 수도원',
        'mists': '안개',
        'roads_avalon': '아발론의 길',
        'solo-dungeon': '솔로 던전',
        'static-dungeon': '고정 던전',
        'territory': '영토',
        'crafting': '제작',
        'exploration': '탐험',
        'faction_warfare': '진영 전쟁',
        'fame_silver_farm': '명성/실버 파밍',
        'gathering': '채집',
        'ganking': '갱킹',
        'pvp': 'PvP',
        'ratting': '랫팅',
        'tracking': '추적',
        'transporting': '운송'
    },
    'zh': {
        'black_zone': '黑区',
        'blue_zone': '蓝区',
        'red_zone': '红区',
        'yellow_zone': '黄区',
        'orange_zone': '橙区',
        'open_world': '开放世界',
        'arena': '竞技场',
        'ava-dungeon': 'Ava 地下城',
        'corrupted-dungeon': '腐蚀地下城',
        'crystal_league': '水晶联赛',
        'depths': '深渊',
        'hellgate': '地狱之门',
        'knightfall_abbey': 'Knightfall 修道院',
        'mists': '迷雾',
        'roads_avalon': '阿瓦隆之路',
        'solo-dungeon': '单人地下城',
        'static-dungeon': '静态地下城',
        'territory': '领土',
        'crafting': '制作',
        'exploration': '探索',
        'faction_warfare': '派系战争',
        'fame_silver_farm': '声望/银币 farming',
        'gathering': '采集',
        'ganking': 'Ganking',
        'pvp': 'PvP',
        'ratting': 'Ratting',
        'tracking': '追踪',
        'transporting': '运输'
    },
    'pl': {
        'black_zone': 'Czarna Strefa',
        'blue_zone': 'Niebieska Strefa',
        'red_zone': 'Czerwona Strefa',
        'yellow_zone': 'Żółta Strefa',
        'orange_zone': 'Pomarańczowa Strefa',
        'open_world': 'Otwarty Świat',
        'arena': 'Arena',
        'ava-dungeon': 'Loch Ava',
        'corrupted-dungeon': 'Spaczone Lochy',
        'crystal_league': 'Liga Kryształowa',
        'depths': 'Głębie',
        'hellgate': 'Piekielne Wrota',
        'knightfall_abbey': 'Opactwo Knightfall',
        'mists': 'Mgły',
        'roads_avalon': 'Drogi Avalonu',
        'solo-dungeon': 'Loch Solo',
        'static-dungeon': 'Loch Statyczne',
        'territory': 'Terytorium',
        'crafting': 'Rzemiosło',
        'exploration': 'Eksploracja',
        'faction_warfare': 'Wojna Frakcji',
        'fame_silver_farm': 'Farmienie Sławy/Srebra',
        'gathering': 'Zbieractwo',
        'ganking': 'Ganking',
        'pvp': 'PvP',
        'ratting': 'Ratting',
        'tracking': 'Śledzenie',
        'transporting': 'Transport'
    },
    'tr': {
        'black_zone': 'Kara Bölge',
        'blue_zone': 'Mavi Bölge',
        'red_zone': 'Kırmızı Bölge',
        'yellow_zone': 'Sarı Bölge',
        'orange_zone': 'Turuncu Bölge',
        'open_world': 'Açık Dünya',
        'arena': 'Arena',
        'ava-dungeon': 'Ava Zindanı',
        'corrupted-dungeon': 'Bozuk Zindan',
        'crystal_league': 'Kristal Ligi',
        'depths': 'Derinlikler',
        'hellgate': 'Cehennem Kapısı',
        'knightfall_abbey': 'Knightfall Manastırı',
        'mists': 'Sisler',
        'roads_avalon': 'Avalon Yolları',
        'solo-dungeon': 'Solo Zindan',
        'static-dungeon': 'Statik Zindan',
        'territory': 'Bölge',
        'crafting': 'Zanaat',
        'exploration': 'Keşif',
        'faction_warfare': 'Faction Savaşı',
        'fame_silver_farm': 'Ün/Gümüş Farmı',
        'gathering': 'Toplama',
        'ganking': 'Ganking',
        'pvp': 'PvP',
        'ratting': 'Ratting',
        'tracking': 'Takip',
        'transporting': 'Taşıma'
    }
};

// Update English first
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

let enUpdated = false;
Object.entries(newTags).forEach(([key, value]) => {
    if (!enContent.BuildView.tagOptions[key]) {
        enContent.BuildView.tagOptions[key] = value;
        enUpdated = true;
    }
});

if (enUpdated) {
    fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n', 'utf8');
    console.log('✓ Updated en.json with new tags');
} else {
    console.log('- en.json already has all tags');
}

// Update other languages
const languages = ['de', 'es', 'fr', 'pt', 'ru', 'ko', 'zh', 'pl', 'tr'];

for (const lang of languages) {
    const filePath = path.join(messagesDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠ Skipping ${lang}.json - file not found`);
        continue;
    }

    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        let updated = false;
        Object.entries(translations[lang]).forEach(([key, value]) => {
            if (!content.BuildView?.tagOptions?.[key]) {
                if (!content.BuildView) content.BuildView = {};
                if (!content.BuildView.tagOptions) content.BuildView.tagOptions = {};
                content.BuildView.tagOptions[key] = value;
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
            console.log(`✓ Updated ${lang}.json`);
        } else {
            console.log(`- ${lang}.json already has all tags`);
        }
    } catch (error) {
        console.error(`✗ Error processing ${lang}.json:`, error.message);
    }
}

console.log('\n✅ Done! All translation files updated with new zone/activity tags.');
