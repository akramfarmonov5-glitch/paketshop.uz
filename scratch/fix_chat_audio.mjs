import { readFileSync, writeFileSync } from 'fs';

const filePath = 'components/AIChatAssistant.tsx';
let content = readFileSync(filePath, 'utf-8');

const oldCode = `      const data = await response.json();\r
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);\r
    } catch (error: any) {`;

const newCode = `      const data = await response.json();\r
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);\r
      \r
      if (data.audioBase64) {\r
        try {\r
          const audio = new Audio('data:audio/wav;base64,' + data.audioBase64);\r
          audio.play().catch(e => console.error("Audio play error:", e));\r
        } catch (e) {\r
          console.error("Audio element error:", e);\r
        }\r
      }\r
    } catch (error: any) {`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  writeFileSync(filePath, content, 'utf-8');
  console.log('✅ AIChatAssistant.tsx audio playback added');
} else {
  console.error('❌ Target code not found in file');
}
