const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '.mvn', 'wrapper');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const jarPath = path.join(dir, 'maven-wrapper.jar');
const file = fs.createWriteStream(jarPath);
const url = 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar';

console.log('Downloading Maven Wrapper JAR...');

function download(downloadUrl) {
  const req = https.get(downloadUrl, { rejectUnauthorized: false }, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      download(response.headers.location);
    } else {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Maven Wrapper JAR downloaded successfully!');
      });
    }
  });

  req.on('error', (err) => {
    fs.unlink(jarPath, () => {});
    console.error('Download error:', err.message);
  });
}

download(url);
