
const NARRATIVE_LONG = "Tenet es una película de acción y ciencia ficción dirigida por Christopher Nolan. ".repeat(20); // ~1600 chars

async function testTTS() {
    console.log(`Testing TTS with payload length: ${NARRATIVE_LONG.length}`);

    try {
        const response = await fetch('http://localhost:3001/api/audio/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                movieTitle: 'Tenet',
                narrative: NARRATIVE_LONG
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`FAILED: ${response.status} - ${text}`);
            process.exit(1);
        }

        const data = await response.json();
        console.log('SUCCESS: Received response');
        console.log(data);

        if (data.success || data.audio_url || data.audio_base64) {
            console.log('✅ TRUNCATION WORKED: Audio was generated despite long input.');
        } else {
            console.error('❌ RESPONSE OK BUT NO AUDIO?');
        }

    } catch (e) {
        console.error('ERROR connecting to server:', e);
    }
}

testTTS();
