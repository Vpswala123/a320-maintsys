const fs = require('fs');
const files = [
    'components.json',
    'subsystems.json',
    'manuals.json',
    'technical_log.json',
    'maintenance_log.json',
    'defect_log.json'
];

for (const f of files) {
    try {
        const raw = fs.readFileSync(__dirname + '/data/' + f, 'utf8');
        JSON.parse(raw);
        console.log(f + " OK");
    } catch (e) {
        console.error("ERROR in " + f + ": " + e.message);
    }
}
