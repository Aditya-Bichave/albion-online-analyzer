const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

// New tags to add with English base
const newTags = {
    '2v2': '2v2',
    '5v5': '5v5',
    'Assassin': 'Assassin',
    'Budget': 'Budget',
    'Burst': 'Burst',
    'Corrupted Dungeon': 'Corrupted Dungeon',
    'Crystal Arena': 'Crystal Arena',
    'DPS': 'DPS',
    'Faction Warfare': 'Faction Warfare',
    'Fame Farm': 'Fame Farm',
    'Gathering': 'Gathering',
    'Healer': 'Healer',
    'Hellgate': 'Hellgate',
    'Mists': 'Mists',
    'Mobility': 'Mobility',
    'Ranged': 'Ranged',
    'Roaming': 'Roaming',
    'Safe': 'Safe',
    'Sustain': 'Sustain',
    'Tank': 'Tank'
};

// Translations for each language (for the new tags)
// These are translations for the 20 new tags
const translations = {
    'de': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Assassine',
        'Budget': 'Budget',
        'Burst': 'Burst',
        'Corrupted Dungeon': 'Verderbtes Dungeon',
        'Crystal Arena': 'Kristallarena',
        'DPS': 'DPS',
        'Faction Warfare': 'Fraktionskrieg',
        'Fame Farm': 'Ruhmfarm',
        'Gathering': 'Sammeln',
        'Healer': 'Heiler',
        'Hellgate': 'Höllentor',
        'Mists': 'Nebel',
        'Mobility': 'Mobilität',
        'Ranged': 'Fernkampf',
        'Roaming': 'Roaming',
        'Safe': 'Sicher',
        'Sustain': 'Sustain',
        'Tank': 'Tank'
    },
    'es': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Asesino',
        'Budget': 'Económico',
        'Burst': 'Explosivo',
        'Corrupted Dungeon': 'Mazmorra Corrupta',
        'Crystal Arena': 'Arena de Cristal',
        'DPS': 'DPS',
        'Faction Warfare': 'Guerra de Facciones',
        'Fame Farm': 'Farm de Fama',
        'Gathering': 'Recolección',
        'Healer': 'Sanador',
        'Hellgate': 'Puerta Infernal',
        'Mists': 'Nieblas',
        'Mobility': 'Movilidad',
        'Ranged': 'A Distancia',
        'Roaming': 'Itinerante',
        'Safe': 'Seguro',
        'Sustain': 'Sustain',
        'Tank': 'Tanque'
    },
    'fr': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Assassin',
        'Budget': 'Économique',
        'Burst': 'Burst',
        'Corrupted Dungeon': 'Donjon Corrompu',
        'Crystal Arena': 'Arène de Cristal',
        'DPS': 'DPS',
        'Faction Warfare': 'Guerre de Factions',
        'Fame Farm': 'Farm de Gloire',
        'Gathering': 'Récolte',
        'Healer': 'Soigneur',
        'Hellgate': 'Porte des Enfers',
        'Mists': 'Brumes',
        'Mobility': 'Mobilité',
        'Ranged': 'À Distance',
        'Roaming': 'Itinérant',
        'Safe': 'Sûr',
        'Sustain': 'Sustain',
        'Tank': 'Tank'
    },
    'pt': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Assassino',
        'Budget': 'Econômico',
        'Burst': 'Burst',
        'Corrupted Dungeon': 'Masmorra Corrompida',
        'Crystal Arena': 'Arena de Cristal',
        'DPS': 'DPS',
        'Faction Warfare': 'Guerra de Facções',
        'Fame Farm': 'Farm de Fama',
        'Gathering': 'Coleta',
        'Healer': 'Curandeiro',
        'Hellgate': 'Portão Infernal',
        'Mists': 'Brumas',
        'Mobility': 'Mobilidade',
        'Ranged': 'À Distância',
        'Roaming': 'Itinerante',
        'Safe': 'Seguro',
        'Sustain': 'Sustain',
        'Tank': 'Tanque'
    },
    'ru': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Убийца',
        'Budget': 'Бюджетный',
        'Burst': 'Берст',
        'Corrupted Dungeon': 'Оскверненное подземелье',
        'Crystal Arena': 'Хрустальная арена',
        'DPS': 'DPS',
        'Faction Warfare': 'Война фракций',
        'Fame Farm': 'Фарм славы',
        'Gathering': 'Сбор ресурсов',
        'Healer': 'Целитель',
        'Hellgate': 'Врата ада',
        'Mists': 'Туманы',
        'Mobility': 'Мобильность',
        'Ranged': 'Дальний бой',
        'Roaming': 'Бродяга',
        'Safe': 'Безопасный',
        'Sustain': 'Сustain',
        'Tank': 'Танк'
    },
    'ko': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': '암살자',
        'Budget': '저비용',
        'Burst': '폭발력',
        'Corrupted Dungeon': '타락한 던전',
        'Crystal Arena': '수정 경기장',
        'DPS': 'DPS',
        'Faction Warfare': '진영 전쟁',
        'Fame Farm': '명성 파밍',
        'Gathering': '채집',
        'Healer': '힐러',
        'Hellgate': '지옥문',
        'Mists': '안개',
        'Mobility': '기동성',
        'Ranged': '원거리',
        'Roaming': '유랑',
        'Safe': '안전한',
        'Sustain': '지속력',
        'Tank': '탱커'
    },
    'zh': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': '刺客',
        'Budget': '经济型',
        'Burst': '爆发',
        'Corrupted Dungeon': '腐蚀地下城',
        'Crystal Arena': '水晶竞技场',
        'DPS': 'DPS',
        'Faction Warfare': '派系战争',
        'Fame Farm': '声望 farming',
        'Gathering': '采集',
        'Healer': '治疗',
        'Hellgate': '地狱之门',
        'Mists': '迷雾',
        'Mobility': '机动性',
        'Ranged': '远程',
        'Roaming': '漫游',
        'Safe': '安全',
        'Sustain': '续航',
        'Tank': '坦克'
    },
    'pl': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Skrytobójca',
        'Budget': 'Budżetowy',
        'Burst': 'Burst',
        'Corrupted Dungeon': 'Spaczone Lochy',
        'Crystal Arena': 'Kryształowa Arena',
        'DPS': 'DPS',
        'Faction Warfare': 'Wojna Frakcji',
        'Fame Farm': 'Farmienie Sławy',
        'Gathering': 'Zbieractwo',
        'Healer': 'Uzdrowiciel',
        'Hellgate': 'Piekielne Wrota',
        'Mists': 'Mgły',
        'Mobility': 'Mobilność',
        'Ranged': 'Dystansowy',
        'Roaming': 'Wędrowiec',
        'Safe': 'Bezpieczny',
        'Sustain': 'Sustain',
        'Tank': 'Tank'
    },
    'tr': {
        '2v2': '2v2',
        '5v5': '5v5',
        'Assassin': 'Suikastçi',
        'Budget': 'Ekonomik',
        'Burst': 'Burst',
        'Corrupted Dungeon': 'Bozuk Zindan',
        'Crystal Arena': 'Kristal Arena',
        'DPS': 'DPS',
        'Faction Warfare': 'Faction Savaşı',
        'Fame Farm': 'Ün Farmı',
        'Gathering': 'Toplama',
        'Healer': 'Şifacı',
        'Hellgate': 'Cehennem Kapısı',
        'Mists': 'Sisler',
        'Mobility': 'Hareketlilik',
        'Ranged': 'Menzilli',
        'Roaming': 'Gezgin',
        'Safe': 'Güvenli',
        'Sustain': 'Sustain',
        'Tank': 'Tank'
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

console.log('\n✅ Done! All translation files updated with new tags.');
