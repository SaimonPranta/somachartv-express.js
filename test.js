const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient();

async function textToSpeechConvert(text) {
  const request = {
    input: { text },
    voice: { languageCode: 'bn-IN', ssmlGender: 'MALE' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
  console.log('Audio content written to file: output.mp3');
}


textToSpeechConvert('আপনার পাঠ্য এখানে লিখুন');
