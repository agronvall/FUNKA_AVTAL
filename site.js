document.addEventListener('DOMContentLoaded', function() {
    const siteDetailsContainer = document.getElementById('siteDetails');
    const cameraTestForm = document.getElementById('cameraTestForm');
    const reportSection = document.getElementById('reportSection');
    const reportContent = document.getElementById('reportContent');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmGenerateButton = document.getElementById('confirmGenerate');
    const cancelGenerateButton = document.getElementById('cancelGenerate');
    const downloadReportButton = document.getElementById('downloadReportButton');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Funktion för att hämta URL-parametrar
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const siteName = getQueryParam('site');

    if (!siteName) {
        siteDetailsContainer.innerHTML = '<p>Inget site angivet.</p>';
        cameraTestForm.innerHTML = '<p>Inget site angivet för att testa kameror.</p>';
        return;
    }

    // Hämta siteData från localStorage
    const storedData = localStorage.getItem('siteData');
    let siteData = null;
    if (storedData) {
        try {
            siteData = JSON.parse(storedData);
        } catch (error) {
            console.error('Error parsing stored JSON:', error);
            siteDetailsContainer.innerHTML = '<p>Fel vid laddning av site data.</p>';
        }
    }

    // Funktion för att visa site detaljer
    function displaySiteDetails(siteData, siteName) {
        if (!siteData[siteName]) {
            siteDetailsContainer.innerHTML = `<p>Site "${siteName}" hittades inte.</p>`;
            return;
        }

        const site = siteData[siteName];

        // Rensa befintligt innehåll
        siteDetailsContainer.innerHTML = '';

        // Skapa element för site namn
        const siteHeader = document.createElement('div');
        siteHeader.classList.add('site-header');
        siteHeader.textContent = siteName;

        // Lista över hårdvara (kameror)
        const hardwareList = document.createElement('ul');
        hardwareList.classList.add('hardware-list');

        if (site.hardware && Array.isArray(site.hardware)) {
            site.hardware.forEach((camera, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('hardware-item');

                const cameraName = document.createElement('span');
                cameraName.textContent = camera;

                const removeBtn = document.createElement('button');
                removeBtn.classList.add('remove-button');
                removeBtn.textContent = 'Ta bort';
                removeBtn.dataset.index = index;

                listItem.appendChild(cameraName);
                listItem.appendChild(removeBtn);
                hardwareList.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.classList.add('hardware-item');
            listItem.textContent = 'Ingen hårdvara angiven.';
            hardwareList.appendChild(listItem);
        }

        // Lägg till element i containern
        siteDetailsContainer.appendChild(siteHeader);
        siteDetailsContainer.appendChild(hardwareList);
    }

    if (siteData) {
        displaySiteDetails(siteData, siteName);
    } else {
        siteDetailsContainer.innerHTML = '<p>Ingen site data hittades. Vänligen ladda site data på huvudidan.</p>';
    }

    // Funktion för att generera Kamera Test Form
    function generateCameraTestForm(siteData, siteName) {
        if (!siteData[siteName] || !siteData[siteName].hardware) {
            cameraTestForm.innerHTML = '<p>Ingen kameradata tillgänglig för test.</p>';
            return;
        }

        const cameras = siteData[siteName].hardware;

        // Rensa befintligt innehåll i formuläret
        cameraTestForm.innerHTML = '';

        cameras.forEach((camera, index) => {
            const cameraDiv = document.createElement('div');
            cameraDiv.classList.add('camera-item');

            const cameraTitle = document.createElement('h3');
            cameraTitle.textContent = camera;
            cameraTitle.style.color = 'var(--primary-color)';
            cameraTitle.style.marginBottom = '10px';

            cameraDiv.appendChild(cameraTitle);

            // Testkriterier med uppdaterade etiketter (Removed "Annan")
            const testCriteria = [
                { label: 'Samtliga linser besiktigade', name: `samtligaLinser_${index}` },
                { label: 'Ockulär besiktning', name: `ockularBesiktning_${index}` },
                { label: 'Ockulär infrastruktur', name: `ockularInfrastruktur_${index}` },
                { label: 'Fungerar inte', name: `fungerarInte_${index}`, special: true }
            ];

            testCriteria.forEach(criteria => {
                const testItem = document.createElement('div');
                testItem.classList.add('test-item');
                if (criteria.special) {
                    testItem.classList.add('not-working');
                }

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = criteria.name;
                checkbox.name = criteria.name;
                checkbox.value = criteria.label;

                const label = document.createElement('label');
                label.htmlFor = criteria.name;
                label.textContent = criteria.label;

                testItem.appendChild(checkbox);
                testItem.appendChild(label);

                cameraDiv.appendChild(testItem);

                // Event Listener för "Fungerar inte" Checkbox
                if (criteria.special) {
                    checkbox.addEventListener('change', function() {
                        if (checkbox.checked) {
                            cameraDiv.classList.add('not-working-card');
                        } else {
                            cameraDiv.classList.remove('not-working-card');
                        }
                    });
                }
            });

            // Kommentarer Sektion
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment-section');

            const commentLabel = document.createElement('label');
            commentLabel.htmlFor = `comment_${index}`;
            commentLabel.textContent = 'Kommentarer:';

            const commentTextarea = document.createElement('textarea');
            commentTextarea.id = `comment_${index}`;
            commentTextarea.name = `comment_${index}`;
            commentTextarea.rows = 3;
            commentTextarea.placeholder = 'Lägg till kommentarer här...';

            commentDiv.appendChild(commentLabel);
            commentDiv.appendChild(commentTextarea);

            cameraDiv.appendChild(commentDiv);

            // Lägg till kameraDiv i formuläret
            cameraTestForm.appendChild(cameraDiv);
        });

        // Skapa Submit Knapp
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.classList.add('btn', 'submit-button');
        submitButton.textContent = 'Generera Rapport';
        submitButton.style.backgroundColor = 'var(--secondary-color)';
        submitButton.innerHTML = '<i class="fas fa-file-alt"></i> Generera Rapport';

        cameraTestForm.appendChild(submitButton);

        // Event Listener för Submit Knapp
        submitButton.addEventListener('click', function() {
            // Visa bekräftelse modal innan rapport genereras
            confirmationModal.style.display = 'flex';
            confirmGenerateButton.focus(); // Set focus to "Ja" button
        });
    }

    // Funktion för att generera Rapport
    async function generateReport(siteData, siteName) {
        const cameras = siteData[siteName].hardware;
        let reportHTML = `<h3>Testrapport för Site: ${siteName}</h3><br/>`;

        // Initiera testresultat om de inte finns
        if (!siteData[siteName].testing) {
            siteData[siteName].testing = [];
        }

        for (let index = 0; index < cameras.length; index++) {
            const camera = cameras[index];
            // Hämta testresultat
            const samtligaLinserElem = document.getElementById(`samtligaLinser_${index}`);
            const ockularBesiktningElem = document.getElementById(`ockularBesiktning_${index}`);
            const ockularInfrastrukturElem = document.getElementById(`ockularInfrastruktur_${index}`);
            const fungerarInteElem = document.getElementById(`fungerarInte_${index}`);
            const commentElem = document.getElementById(`comment_${index}`);

            // Kontrollera om element finns
            if (!samtligaLinserElem || !ockularBesiktningElem || !ockularInfrastrukturElem || !fungerarInteElem || !commentElem) {
                console.warn(`Missing elements for camera index ${index}. Skipping...`);
                continue;
            }

            const testResult = {
                samtligaLinser: samtligaLinserElem.checked,
                ockularBesiktning: ockularBesiktningElem.checked,
                ockularInfrastruktur: ockularInfrastrukturElem.checked,
                fungerarInte: fungerarInteElem.checked,
                comments: commentElem.value.trim()
            };

            // Spara till siteData
            siteData[siteName].testing[index] = testResult;

            // Bestäm om kameran ska visas i rött
            const cameraNameHTML = testResult.fungerarInte 
                ? `<span style="color: red;">${camera}</span>` 
                : `${camera}`;

            // Generera rapporttext med hårdvarunamn som kameranamn
            reportHTML += `<strong>Kamera: ${cameraNameHTML}</strong><br/>`;
            reportHTML += `- Samtliga linser besiktigade: ${testResult.samtligaLinser ? '✓' : '✗'}<br/>`;
            reportHTML += `- Ockulär besiktning: ${testResult.ockularBesiktning ? '✓' : '✗'}<br/>`;
            reportHTML += `- Ockulär infrastruktur: ${testResult.ockularInfrastruktur ? '✓' : '✗'}<br/>`;
            reportHTML += `- Fungerar inte: ${testResult.fungerarInte ? '✓' : '✗'}<br/>`;
            reportHTML += `- Kommentarer: ${testResult.comments || 'Ingen kommentar.'}<br/><br/>`;
        }

        // Spara uppdaterad siteData till localStorage
        localStorage.setItem('siteData', JSON.stringify(siteData));

        // Visa Rapport
        reportContent.innerHTML = reportHTML;
        reportSection.style.display = 'block';

        // Skapa Email-knapp om det finns "fungerar inte" enheter
        const malfunctioningDevices = getMalfunctioningDevices(siteData, siteName);
        if (malfunctioningDevices.length > 0) {
            createEmailButton(malfunctioningDevices);
        }
    }

    // Funktion för att skapa Email-knapp
    function createEmailButton(devices) {
        // Kontrollera om knappen redan finns
        if (document.getElementById('emailReportButton')) return;

        const emailButton = document.createElement('button');
        emailButton.id = 'emailReportButton';
        emailButton.classList.add('btn', 'email-button');
        emailButton.textContent = 'Skicka Rapport via E-post';
        emailButton.style.backgroundColor = '#4CAF50'; // Grön färg
        emailButton.style.marginTop = '20px';
        emailButton.innerHTML = '<i class="fas fa-envelope"></i> Skicka Rapport via E-post';

        // Lägg till knappen i rapport sektionen
        reportSection.appendChild(emailButton);

        // Event Listener för Email-knappen
        emailButton.addEventListener('click', function() {
            const malfunctioningDevices = getMalfunctioningDevices(siteData, siteName);
            sendEmailReport(malfunctioningDevices);
        });
    }

    // Funktion för att hämta alla "fungerar inte" enheter
    function getMalfunctioningDevices(siteData, siteName) {
        const cameras = siteData[siteName].hardware;
        const malfunctioning = [];

        cameras.forEach((camera, index) => {
            const testResult = siteData[siteName].testing[index];
            if (testResult && testResult.fungerarInte) {
                malfunctioning.push({
                    camera: camera,
                    site: siteName,
                    comments: testResult.comments || 'Ingen kommentar.'
                });
            }
        });

        return malfunctioning;
    }

    // Funktion för att skicka rapport via e-post
    async function sendEmailReport(devices) {
        if (devices.length === 0) {
            alert('Det finns inga enheter som kräver service.');
            return;
        }

        // Ändra modal innehåll för e-postbekräftelse
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        modalTitle.textContent = 'Bekräfta E-postsändning';
        modalDescription.textContent = 'Är du säker på att du vill skicka rapporten via e-post till stakeholders?';

        // Visa bekräftelse modal
        confirmationModal.style.display = 'flex';
        confirmGenerateButton.focus(); // Sätt fokus till "Ja" knappen

        // Temporärt ändra event listener för bekräfta knappen till e-postsändning
        const originalOnClick = confirmGenerateButton.onclick;

        confirmGenerateButton.onclick = async function() {
            confirmationModal.style.display = 'none';
            loadingIndicator.style.display = 'flex';

            // Skapa en snyggt formaterad rapport
            const formattedReport = formatReportForEmail(devices);

            try {
                const response = await fetch('http://localhost:3000/api/sendBulkServiceEmail', { // Uppdatera URL om servern körs på annan adress
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        site: siteName,
                        devices: devices,
                        report: formattedReport
                    })
                });

                if (!response.ok) {
                    throw new Error('Något gick fel med e-postförfrågan.');
                }

                alert('Rapporten har skickats via e-post framgångsrikt.');
            } catch (error) {
                console.error('Fel vid skickande av e-post:', error);
                alert('Det uppstod ett fel vid skickande av e-postrapporten.');
            } finally {
                loadingIndicator.style.display = 'none';
            }

            // Återställ modal innehåll och event listener
            modalTitle.textContent = 'Bekräfta Rapportgenerering';
            modalDescription.textContent = 'Är du säker på att du vill generera rapporten?';
            confirmGenerateButton.onclick = originalOnClick;
        };
    }

    // Funktion för att formatera rapporten för e-post
    function formatReportForEmail(devices) {
        let report = `<h2>Testrapport - Enheter som kräver service</h2>`;
        report += `<p>Site: <strong>${devices[0].site}</strong></p>`;
        report += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">`;
        report += `<thead><tr><th>Kamera</th><th>Kommentarer</th></tr></thead><tbody>`;

        devices.forEach(device => {
            report += `<tr>`;
            report += `<td>${device.camera}</td>`;
            report += `<td>${device.comments}</td>`;
            report += `</tr>`;
        });

        report += `</tbody></table>`;
        return report;
    }

    // Funktion för att ladda befintliga testresultat
    function loadExistingTestResults(siteData, siteName) {
        if (!siteData[siteName].testing) return;

        const cameras = siteData[siteName].hardware;

        cameras.forEach((camera, index) => {
            const testResult = siteData[siteName].testing[index];
            if (testResult) {
                const samtligaLinserElem = document.getElementById(`samtligaLinser_${index}`);
                const ockularBesiktningElem = document.getElementById(`ockularBesiktning_${index}`);
                const ockularInfrastrukturElem = document.getElementById(`ockularInfrastruktur_${index}`);
                const fungerarInteElem = document.getElementById(`fungerarInte_${index}`);
                const commentElem = document.getElementById(`comment_${index}`);

                if (samtligaLinserElem) samtligaLinserElem.checked = testResult.samtligaLinser;
                if (ockularBesiktningElem) ockularBesiktningElem.checked = testResult.ockularBesiktning;
                if (ockularInfrastrukturElem) ockularInfrastrukturElem.checked = testResult.ockularInfrastruktur;
                if (fungerarInteElem) {
                    fungerarInteElem.checked = testResult.fungerarInte;
                    if (testResult.fungerarInte) {
                        const cameraDiv = samtligaLinserElem.closest('.camera-item');
                        if (cameraDiv) {
                            cameraDiv.classList.add('not-working-card');
                        }
                    }
                }
                if (commentElem) commentElem.value = testResult.comments;
            }
        });
    }

    // Funktion för att ladda ner rapporten som .txt fil
    function downloadReportAsTXT() {
        const reportText = reportContent.textContent;
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Testrapport_${siteName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Funktion för att ladda ner rapporten som PDF
    async function downloadReportAsPDF() {
        try {
            // Visa laddningsindikator
            loadingIndicator.style.display = 'flex';

            // Fånga rapport sektionen som en canvas
            const canvas = await html2canvas(reportSection, { scale: 2 });

            // Dela canvas i flera sidor om det behövs
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm marginal på varje sida
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight() - 20; // 10mm marginal på toppen och botten
            let heightLeft = pdfHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            // Spara PDF
            pdf.save(`Testrapport_${siteName}.pdf`);

            // Dölj laddningsindikator
            loadingIndicator.style.display = 'none';
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Det uppstod ett fel vid generering av PDF-rapporten.');
            loadingIndicator.style.display = 'none';
        }
    }

    // Funktion för att stänga Bekräftelse Modal
    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
        // Return focus till "Generera Rapport" button
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.focus();
        }

        // Återställ modal innehåll om det ändrades
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        modalTitle.textContent = 'Bekräfta Rapportgenerering';
        modalDescription.textContent = 'Är du säker på att du vill generera rapporten?';

        // Återställ bekräfta knappen event listener till rapportgenerering
        confirmGenerateButton.onclick = async function() {
            await generateReport(siteData, siteName);
            confirmationModal.style.display = 'none';
        };
    }

    // Event Listener för Bekräfta Generera Knapp
    if (confirmGenerateButton) {
        confirmGenerateButton.addEventListener('click', async function() {
            // Determine current modal context
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle.textContent === 'Bekräfta Rapportgenerering') {
                await generateReport(siteData, siteName);
                confirmationModal.style.display = 'none';
            } else if (modalTitle.textContent === 'Bekräfta E-postsändning') {
                // This case is handled within sendEmailReport to avoid duplication
                // So you might not need to handle it here
            }
        });
    }

    // Event Listener för Avbryt Generera Knapp
    if (cancelGenerateButton) {
        cancelGenerateButton.addEventListener('click', closeConfirmationModal);
    }

    // Event Listener för Ladda Ner Rapport Knapp
    if (downloadReportButton) {
        downloadReportButton.addEventListener('click', downloadReportAsPDF);
        // Om du föredrar att ladda ner som TXT kan du lägga till en annan knapp eller ändra denna rad
        // downloadReportButton.addEventListener('click', downloadReportAsTXT);
    }

    // Funktion för att initiera formuläret och ladda befintlig data
    function initializeForm() {
        if (siteData) {
            generateCameraTestForm(siteData, siteName);
            loadExistingTestResults(siteData, siteName);
        }
    }

    // Initiera formuläret
    initializeForm();

    // Funktion för att hantera removal av kameror
    function handleRemoveCamera(index) {
        if (!siteData || !siteData[siteName] || !siteData[siteName].hardware) return;

        // Ta bort kameran från hardware array
        siteData[siteName].hardware.splice(index, 1);

        // Ta bort testresultat om det finns
        if (siteData[siteName].testing && siteData[siteName].testing.length > index) {
            siteData[siteName].testing.splice(index, 1);
        }

        // Spara uppdaterad siteData till localStorage
        localStorage.setItem('siteData', JSON.stringify(siteData));

        // Uppdatera sidan
        displaySiteDetails(siteData, siteName);
        generateCameraTestForm(siteData, siteName);
        loadExistingTestResults(siteData, siteName);
    }

    // Event Delegation för Remove Knappar
    siteDetailsContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('remove-button')) {
            const index = parseInt(event.target.dataset.index, 10);
            if (isNaN(index)) {
                console.error('Invalid index for removal.');
                return;
            }
            const cameraName = siteData[siteName].hardware[index];
            if (confirm(`Är du säker på att du vill ta bort kameran "${cameraName}"?`)) {
                handleRemoveCamera(index);
            }
        }
    });

    // Event Listener för att stänga modal när man klickar utanför modal-content
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
});
