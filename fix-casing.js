const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts')) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('OPERATIONS/')) {
                    results.push(file);
                }
            }
        }
    });
    return results;
}

const files = walk('d:/Azent Systems/Mark_Vezta_Common_Project/src/app');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/OPERATIONS\//g, 'Operations/');
    fs.writeFileSync(f, content, 'utf8');
});
console.log('Replaced in ' + files.length + ' files');
