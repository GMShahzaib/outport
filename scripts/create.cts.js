import * as fs from 'fs';

const source = 'lib/index.d.ts';
const destination = 'lib/index.d.cts';

fs.copyFile(source, destination, (err) => {
    if (err) {
        console.error('Error occurred:', err);
        return;
    }
});
