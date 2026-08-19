import fs from 'fs';

const html = fs.readFileSync('resume/index.html', 'utf8');
const startIdx = html.indexOf('const content = {');
if (startIdx === -1) {
  console.error('Could not find content object');
  process.exit(1);
}

// Find the matching closing brace for the content object
let braceCount = 0;
let endIdx = -1;
for (let i = startIdx + 'const content = '.length; i < html.length; i++) {
  if (html[i] === '{') {
    braceCount++;
  } else if (html[i] === '}') {
    braceCount--;
    if (braceCount === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find matching closing brace');
  process.exit(1);
}

const contentStr = html.substring(startIdx, endIdx);
// We can evaluate this string in a safe context to get the object
// Since it's a const declaration, we can wrap it in a function and return it
const getObject = new Function(contentStr + '; return content;');
const contentObj = getObject();

fs.writeFileSync('resume_data.json', JSON.stringify(contentObj, null, 2));
console.log('Successfully extracted resume data to resume_data.json');
