const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '.mvn', 'wrapper');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(path.join(dir, 'maven-wrapper.jar'));
const url = 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar';

console.log('Downloading Maven Wrapper JAR...');
https.get(url, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Maven Wrapper JAR downloaded successfully!');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Maven Wrapper JAR downloaded successfully!');
    });
  }
}).on('error', (err) => {
  fs.unlink(path.join(dir, 'maven-wrapper.jar'), () => {});
  console.error('Download error:', err.message);
});
