
let vocabulary = {};

$(document).ready(function () {
    // Real-time color coding for words
    $('#wordInput').on('input', function () {
        const words = $(this).val().split('\n');
        let coloredOutput = '';

        words.forEach(word => {
            word = word.trim();
            if (word) {
                const article = word.split(' ')[0];
                let className = '';
                if (['der', 'Der'].includes(article)) className = 'der';
                else if (['die', 'Die'].includes(article)) className = 'die';
                else if (['das', 'Das'].includes(article)) className = 'das';
                coloredOutput += `<div class="output-word ${className}">${word}</div>`;
            }
        });

        $('#previewContainer').html(coloredOutput);
    });

    // Real-time preview for notes
    $('#notesInput').on('input', function () {
        const notes = $(this).val().split('\n').filter(note => note.trim());
        let output = notes.map(note => `<div class="output-note">${note}</div>`).join('');
        $('#notesPreview').html(output);
    });

    // Real-time preview for verbs
    $('#verbsInput').on('input', function () {
        const verbs = $(this).val().split('\n').filter(verb => verb.trim());
        let output = verbs.map(verb => `<div class="output-verb">${verb}</div>`).join('');
        $('#verbsPreview').html(output);
    });

    // Add words, notes, and verbs to vocabulary
    $('#addWords').click(function () {
        const title = $('#title').val().trim();
        const words = $('#wordInput').val().split('\n').map(word => word.trim()).filter(word => word);
        const notes = $('#notesInput').val().split('\n').map(note => note.trim()).filter(note => note);
        const verbs = $('#verbsInput').val().split('\n').map(verb => verb.trim()).filter(verb => verb);

        // Validate words
        if (words.length > 0) {
            const articles = ['der', 'die', 'das', 'Der', 'Die', 'Das'];
            for (const word of words) {
                const article = word.split(' ')[0];
                if (!articles.includes(article) || word.split(' ').length < 2) {
                    alert(`Invalid word: "${word}". Use a valid article (der, die, das, Der, Die, Das) followed by a word.`);
                    return;
                }
            }
        }

        // Store words, notes, and verbs under title
        vocabulary[title] = { words, notes, verbs };
        $('#title').val('');
        $('#wordInput').val('');
        $('#notesInput').val('');
        $('#verbsInput').val('');
        updateVocabList();
    });

    // Save as PDF
    $('#savePDF').click(function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yOffset = 10;

        // Add document title
        doc.setFontSize(16);
        doc.text('German Article Practice', 10, yOffset);
        yOffset += 10;

        // Check if vocabulary is empty
        if (Object.keys(vocabulary).length === 0) {
            doc.setFontSize(12);
            doc.text('No vocabulary added.', 10, yOffset);
            doc.save('German_Vocabulary.pdf');
            return;
        }

        // Iterate through vocabulary
        for (const [title, { words, notes, verbs }] of Object.entries(vocabulary)) {
            // Add title
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0); // Black for title
            doc.text(title, 10, yOffset);
            yOffset += 7;

            // Add words
            if (words.length > 0) {
                doc.setFontSize(12);
                doc.text('Words:', 10, yOffset);
                yOffset += 7;
                words.forEach(word => {
                    const article = word.split(' ')[0].toLowerCase();
                    let color = [0, 0, 0]; // Default black
                    switch (article) {
                        case 'der': color = [0, 0, 0]; break; // Black
                        case 'die': color = [255, 0, 0]; break; // red
                        case 'das': color = [0, 0, 255]; break; // Blue
                    }
                    doc.setTextColor(...color);
                    doc.text(`- ${word}`, 15, yOffset);
                    yOffset += 7;
                });
            }

            // Add notes
            if (notes.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0); // Black for notes
                doc.text('Notes:', 10, yOffset);
                yOffset += 7;
                notes.forEach(note => {
                    doc.text(`- ${note}`, 15, yOffset);
                    yOffset += 7;
                });
            }

            // Add verbs
            if (verbs.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0); // Black for verbs
                doc.text('Verbs:', 10, yOffset);
                yOffset += 7;
                verbs.forEach(verb => {
                    doc.text(`- ${verb}`, 15, yOffset);
                    yOffset += 7;
                });
            }

            yOffset += 5; // Extra spacing after each title
        }

        doc.save('German_Vocabulary.pdf');
    });
});

document.getElementById("fetchNewsBtn").addEventListener("click", async () => {
    const container = document.getElementById("newsContainer");
    container.innerHTML = '<p class="text-gray-500">Lade Nachrichten...</p>';

    try {
        const res = await fetch("https://api.mediastack.com/v1/news?access_key=da15d9cc160962bc6f00e00f8fc493cf&countries=de&language=de");
        const data = await res.json();

        if (data && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(article => `
          <div class="p-4 border rounded-lg bg-white shadow hover:shadow-md transition">
            <h2 class="text-lg font-semibold text-blue-800">${article.title}</h2>
            <p class="text-gray-700 mt-1">${article.description || 'Keine Beschreibung verfügbar.'}</p>
            <a href="${article.url}" target="_blank" class="text-blue-600 hover:underline mt-2 inline-block">Weiterlesen</a>
            <p class="text-sm text-gray-500 mt-1">${new Date(article.published_at).toLocaleString('de-DE')}</p>
          </div>
        `).join("");
        } else {
            container.innerHTML = '<p class="text-red-600">Keine Nachrichten gefunden.</p>';
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-red-600">Fehler beim Laden der Nachrichten.</p>';
    }
});

function updateVocabList() {
    const container = $('#wordContainer');
    container.empty();

    for (const [title, { words, notes, verbs }] of Object.entries(vocabulary)) {
        const titleDiv = $('<div>').addClass('mb-4');
        titleDiv.append(`<h3 class="text-md font-medium">${title}</h3>`);

        // Words
        if (words.length > 0) {
            const wordList = $('<ul>').addClass('list-disc pl-5');
            words.forEach(word => {
                const article = word.split(' ')[0].toLowerCase();
                const li = $('<li>').html(`<span class="${article}">${word}</span>`);
                wordList.append(li);
            });
            titleDiv.append('<h4 class="text-sm font-semibold mt-2">Words:</h4>');
            titleDiv.append(wordList);
        }

        // Notes
        if (notes.length > 0) {
            const noteList = $('<ul>').addClass('list-disc pl-5');
            notes.forEach(note => {
                const li = $('<li>').text(note);
                noteList.append(li);
            });
            titleDiv.append('<h4 class="text-sm font-semibold mt-2">Notes:</h4>');
            titleDiv.append(noteList);
        }

        // Verbs
        if (verbs.length > 0) {
            const verbList = $('<ul>').addClass('list-disc pl-5');
            verbs.forEach(verb => {
                const li = $('<li>').text(verb);
                verbList.append(li);
            });
            titleDiv.append('<h4 class="text-sm font-semibold mt-2">Verbs:</h4>');
            titleDiv.append(verbList);
        }

        container.append(titleDiv);
    }
}
