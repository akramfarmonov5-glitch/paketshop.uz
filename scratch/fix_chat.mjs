import { readFileSync, writeFileSync } from 'fs';

const filePath = 'components/AIChatAssistant.tsx';
let content = readFileSync(filePath, 'utf-8');

const oldCode = `      const data = await response.json();\r
\r
      if (!response.ok) {\r
        throw new Error(data.error || 'Server xatosi');\r
      }\r
\r
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);`;

const newCode = `      if (!response.ok) {\r
        let errMsg = 'Server xatosi';\r
        try {\r
          const errData = await response.json();\r
          errMsg = errData.error || errMsg;\r
        } catch {\r
          errMsg = \`Server javob bermadi (Status: \${response.status})\`;\r
        }\r
        throw new Error(errMsg);\r
      }\r
\r
      const data = await response.json();\r
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  writeFileSync(filePath, content, 'utf-8');
  console.log('✅ AIChatAssistant.tsx patched successfully');
} else {
  console.error('❌ Target code not found in file');
  // Debug: show what's around line 119
  const lines = content.split('\n');
  for (let i = 117; i < 127; i++) {
    console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
  }
}
