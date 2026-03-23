const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

// New translations to add to the Builds section
const newTranslations = {
    'filters': 'Filters',
    'filterByTags': 'Filter by Tags',
    'filterByZone': 'Filter by Zone',
    'filterByActivity': 'Filter by Activity',
    'filterByRole': 'Filter by Role',
    'allZones': 'All Zones',
    'allActivities': 'All Activities',
    'allRoles': 'All Roles',
    'clearFilters': 'Clear Filters',
    'activeFilters': 'Active Filters'
};

const translations = {
    'de': {
        'filters': 'Filter',
        'filterByTags': 'Filter nach Tags',
        'filterByZone': 'Filter nach Zone',
        'filterByActivity': 'Filter nach Aktivität',
        'filterByRole': 'Filter nach Rolle',
        'allZones': 'Alle Zonen',
        'allActivities': 'Alle Aktivitäten',
        'allRoles': 'Alle Rollen',
        'clearFilters': 'Filter löschen',
        'activeFilters': 'Aktive Filter'
    },
    'es': {
        'filters': 'Filtros',
        'filterByTags': 'Filtrar por Etiquetas',
        'filterByZone': 'Filtrar por Zona',
        'filterByActivity': 'Filtrar por Actividad',
        'filterByRole': 'Filtrar por Rol',
        'allZones': 'Todas las Zonas',
        'allActivities': 'Todas las Actividades',
        'allRoles': 'Todos los Roles',
        'clearFilters': 'Limpiar Filtros',
        'activeFilters': 'Filtros Activos'
    },
    'fr': {
        'filters': 'Filtres',
        'filterByTags': 'Filtrer par Tags',
        'filterByZone': 'Filtrer par Zone',
        'filterByActivity': 'Filtrer par Activité',
        'filterByRole': 'Filtrer par Rôle',
        'allZones': 'Toutes les Zones',
        'allActivities': 'Toutes les Activités',
        'allRoles': 'Tous les Rôles',
        'clearFilters': 'Effacer les Filtres',
        'activeFilters': 'Filtres Actifs'
    },
    'pt': {
        'filters': 'Filtros',
        'filterByTags': 'Filtrar por Tags',
        'filterByZone': 'Filtrar por Zona',
        'filterByActivity': 'Filtrar por Atividade',
        'filterByRole': 'Filtrar por Função',
        'allZones': 'Todas as Zonas',
        'allActivities': 'Todas as Atividades',
        'allRoles': 'Todas as Funções',
        'clearFilters': 'Limpar Filtros',
        'activeFilters': 'Filtros Ativos'
    },
    'ru': {
        'filters': 'Фильтры',
        'filterByTags': 'Фильтр по тегам',
        'filterByZone': 'Фильтр по зоне',
        'filterByActivity': 'Фильтр по активности',
        'filterByRole': 'Фильтр по роли',
        'allZones': 'Все зоны',
        'allActivities': 'Все активности',
        'allRoles': 'Все роли',
        'clearFilters': 'Очистить фильтры',
        'activeFilters': 'Активные фильтры'
    },
    'ko': {
        'filters': '필터',
        'filterByTags': '태그로 필터링',
        'filterByZone': '지역으로 필터링',
        'filterByActivity': '활동으로 필터링',
        'filterByRole': '역할로 필터링',
        'allZones': '모든 지역',
        'allActivities': '모든 활동',
        'allRoles': '모든 역할',
        'clearFilters': '필터 초기화',
        'activeFilters': '활성 필터'
    },
    'zh': {
        'filters': '过滤器',
        'filterByTags': '按标签过滤',
        'filterByZone': '按区域过滤',
        'filterByActivity': '按活动过滤',
        'filterByRole': '按角色过滤',
        'allZones': '所有区域',
        'allActivities': '所有活动',
        'allRoles': '所有角色',
        'clearFilters': '清除过滤器',
        'activeFilters': '活动过滤器'
    },
    'pl': {
        'filters': 'Filtry',
        'filterByTags': 'Filtruj po Tagach',
        'filterByZone': 'Filtruj po Strefie',
        'filterByActivity': 'Filtruj po Aktywności',
        'filterByRole': 'Filtruj po Roli',
        'allZones': 'Wszystkie Strefy',
        'allActivities': 'Wszystkie Aktywności',
        'allRoles': 'Wszystkie Role',
        'clearFilters': 'Wyczyść Filtry',
        'activeFilters': 'Aktywne Filtry'
    },
    'tr': {
        'filters': 'Filtreler',
        'filterByTags': 'Etikete Göre Filtrele',
        'filterByZone': 'Bölgeye Göre Filtrele',
        'filterByActivity': 'Aktiviteye Göre Filtrele',
        'filterByRole': 'Role Göre Filtrele',
        'allZones': 'Tüm Bölgeler',
        'allActivities': 'Tüm Aktiviteler',
        'allRoles': 'Tüm Roller',
        'clearFilters': 'Filtreleri Temizle',
        'activeFilters': 'Aktif Filtreler'
    }
};

// Update English first
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Check if already exists
let enUpdated = false;
if (!enContent.Builds.filters) {
    Object.entries(newTranslations).forEach(([key, value]) => {
        enContent.Builds[key] = value;
    });
    enUpdated = true;
}

if (enUpdated) {
    fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n', 'utf8');
    console.log('✓ Updated en.json with filter UI translations');
} else {
    console.log('- en.json already has filter UI translations');
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
            if (!content.Builds?.[key]) {
                if (!content.Builds) content.Builds = {};
                content.Builds[key] = value;
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
            console.log(`✓ Updated ${lang}.json`);
        } else {
            console.log(`- ${lang}.json already has translations`);
        }
    } catch (error) {
        console.error(`✗ Error processing ${lang}.json:`, error.message);
    }
}

console.log('\n✅ Done! All translation files updated with filter UI translations.');
