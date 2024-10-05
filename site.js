document.addEventListener('DOMContentLoaded', function() {
    const siteDetailsContainer = document.getElementById('siteDetails');
    const cameraTestForm = document.getElementById('cameraTestForm');
    const reportSection = document.getElementById('reportSection');
    const reportContent = document.getElementById('reportContent');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmActionButton = document.getElementById('confirmAction');
    const cancelActionButton = document.getElementById('cancelAction');
    const downloadReportButton = document.getElementById('downloadReportButton');
    const emailReportButton = document.getElementById('emailReportButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const userEmailInput = document.getElementById('userEmail');

    // Function to get URL parameters
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

    // Get siteData from localStorage
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

    // Function to display site details
    function displaySiteDetails(siteData, siteName) {
        if (!siteData[siteName]) {
            siteDetailsContainer.innerHTML = `<p>Site "${siteName}" hittades inte.</p>`;
            return;
        }

        const site = siteData[siteName];

        // Clear existing content
        siteDetailsContainer.innerHTML = '';

        // Create site name element
        const siteHeader = document.createElement('div');
        siteHeader.classList.add('site-header');
        siteHeader.textContent = siteName;

        // Create hardware list
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

        // Add elements to the container
        siteDetailsContainer.appendChild(siteHeader);
        siteDetailsContainer.appendChild(hardwareList);
    }

    if (siteData) {
        displaySiteDetails(siteData, siteName);
    } else {
        siteDetailsContainer.innerHTML = '<p>Ingen site data hittades. Vänligen ladda site data på huvudidan.</p>';
    }

    // Function to generate Camera Test Form
    function generateCameraTestForm(siteData, siteName) {
        if (!siteData[siteName] || !siteData[siteName].hardware) {
            cameraTestForm.innerHTML = '<p>Ingen kameradata tillgänglig för test.</p>';
            return;
        }

        const cameras = siteData[siteName].hardware;

        // Clear existing form content
        cameraTestForm.innerHTML = '';

        cameras.forEach((camera, index) => {
            const cameraDiv = document.createElement('div');
            cameraDiv.classList.add('camera-item');

            const cameraTitle = document.createElement('h3');
            cameraTitle.textContent = camera;
            cameraTitle.style.color = 'var(--primary-color)';
            cameraTitle.style.marginBottom = '10px';

            cameraDiv.appendChild(cameraTitle);

            // Test criteria without "Other"
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

                // Event Listener for "Fungerar inte" Checkbox
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

            // Comments Section
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

            // Add cameraDiv to form
            cameraTestForm.appendChild(cameraDiv);
        });

        // Create Submit Button
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.classList.add('btn', 'submit-button');
        submitButton.textContent = 'Generera Rapport';
        submitButton.style.backgroundColor = 'var(--secondary-color)';
        submitButton.innerHTML = '<i class="fas fa-file-alt"></i> Generera Rapport';

        cameraTestForm.appendChild(submitButton);

        // Event Listener for Submit Button
        submitButton.addEventListener('click', function() {
            confirmationModal.style.display = 'flex';
            confirmActionButton.focus();

            // Temporarily change modal content for report generation
            const modalTitle = document.getElementById('modalTitle');
            const modalDescription = document.getElementById('modalDescription');

            modalTitle.textContent = 'Bekräfta Rapportgenerering';
            modalDescription.textContent = 'Är du säker på att du vill generera rapporten?';
        });
    }

    // Function to generate Report
    async function generateReport(siteData, siteName) {
        const cameras = siteData[siteName].hardware;
        let reportHTML = `Testrapport för Site: ${siteName}\n<hr/>\n`;
        let reportText = `Testrapport för Site: ${siteName}\n\n`;
        let emailText = `Testrapport för Site: ${siteName}\n\n`;
    
        if (!siteData[siteName].testing) {
            siteData[siteName].testing = [];
        }
    
        for (let index = 0; index < cameras.length; index++) {
            const camera = cameras[index];
            const samtligaLinserElem = document.getElementById(`samtligaLinser_${index}`);
            const ockularBesiktningElem = document.getElementById(`ockularBesiktning_${index}`);
            const ockularInfrastrukturElem = document.getElementById(`ockularInfrastruktur_${index}`);
            const fungerarInteElem = document.getElementById(`fungerarInte_${index}`);
            const commentElem = document.getElementById(`comment_${index}`);
    
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
    
            siteData[siteName].testing[index] = testResult;
    
            const cameraNameHTML = testResult.fungerarInte 
                ? `<span style="color: red;">${camera}</span>` 
                : `${camera}`;
    
            // Full report includes all cameras
            reportHTML += `<strong>Kamera: ${cameraNameHTML}</strong><br/>`;
            reportHTML += `- Samtliga linser besiktigade: ${testResult.samtligaLinser ? '✓' : '✗'}<br/>`;
            reportHTML += `- Ockulär besiktning: ${testResult.ockularBesiktning ? '✓' : '✗'}<br/>`;
            reportHTML += `- Ockulär infrastruktur: ${testResult.ockularInfrastruktur ? '✓' : '✗'}<br/>`;
            reportHTML += `- Fungerar inte: ${testResult.fungerarInte ? '✓' : '✗'}<br/>`;
            reportHTML += `- Kommentarer: ${testResult.comments || 'Ingen kommentar.'}<br/><br/>`;
    
            // Full text report
            reportText += `Kamera: ${testResult.fungerarInte ? '✗ ' : '✓ '} ${camera}\n`;
            reportText += `- Samtliga linser besiktigade: ${testResult.samtligaLinser ? '✓' : '✗'}\n`;
            reportText += `- Ockulär besiktning: ${testResult.ockularBesiktning ? '✓' : '✗'}\n`;
            reportText += `- Ockulär infrastruktur: ${testResult.ockularInfrastruktur ? '✓' : '✗'}\n`;
            reportText += `- Fungerar inte: ${testResult.fungerarInte ? '✓' : '✗'}\n`;
            reportText += `- Kommentarer: ${testResult.comments || 'Ingen kommentar.'}\n\n`;
    
            // Email report includes only cameras with "fungerar inte"
            if (testResult.fungerarInte) {
                emailText += `Kamera: ✗ ${camera}\n`;
                emailText += `- Samtliga linser besiktigade: ${testResult.samtligaLinser ? '✓' : '✗'}\n`;
                emailText += `- Ockulär besiktning: ${testResult.ockularBesiktning ? '✓' : '✗'}\n`;
                emailText += `- Ockulär infrastruktur: ${testResult.ockularInfrastruktur ? '✓' : '✗'}\n`;
                emailText += `- Fungerar inte: ${testResult.fungerarInte ? '✓' : '✗'}\n`;
                emailText += `- Kommentarer: ${testResult.comments || 'Ingen kommentar.'}\n\n`;
            }
        }
    
        localStorage.setItem('siteData', JSON.stringify(siteData));
    
        reportContent.innerHTML = reportHTML;
        reportSection.style.display = 'block';
    
        // Store full report text for download
        reportSection.dataset.reportText = reportText;
    
        // Store email content only for "fungerar inte" cameras
        reportSection.dataset.emailText = emailText;
    }
        
    // Function to send email report via mailto:
    function sendEmailReport() {
        const userEmail = userEmailInput.value.trim();
        if (!userEmail) {
            alert('Vänligen ange din e-postadress.');
            return;
        }
    
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userEmail)) {
            alert('Vänligen ange en giltig e-postadress.');
            return;
        }
    
        const siteName = getQueryParam('site');
        const subject = `Testrapport för Site: ${siteName}`;
        const emailText = reportSection.dataset.emailText;
    
        if (!emailText) {
            alert('Ingen rapport att skicka. Generera rapporten först.');
            return;
        }
    
        const formattedBody = encodeURIComponent(emailText);
        const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${formattedBody}`;
    
        if (mailtoLink.length > 2000) {
            alert('Rapporten är för lång för att skickas via e-post. Ladda ner rapporten som PDF och bifoga manuellt.');
            return;
        }
    
        window.location.href = mailtoLink;
    }
    
    // Function to load existing test results
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

    // Function to download report as PDF
    async function downloadReportAsPDF() {
        try {
            loadingIndicator.style.display = 'flex';

            const canvas = await html2canvas(reportSection, { scale: 2 });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight() - 20;
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

            pdf.save(`Testrapport_${siteName}.pdf`);

            loadingIndicator.style.display = 'none';
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Det uppstod ett fel vid generering av PDF-rapporten.');
            loadingIndicator.style.display = 'none';
        }
    }

    // Function to close confirmation modal
    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
        const activeButton = document.querySelector('.submit-button, .email-button');
        if (activeButton) {
            activeButton.focus();
        }

        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        modalTitle.textContent = 'Bekräfta Åtgärd';
        modalDescription.textContent = 'Är du säker på att du vill utföra denna åtgärd?';
    }

    // Event Listener for Confirm Action Button
    if (confirmActionButton) {
        confirmActionButton.addEventListener('click', async function() {
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle.textContent === 'Bekräfta Rapportgenerering') {
                await generateReport(siteData, siteName);
                confirmationModal.style.display = 'none';
            } else if (modalTitle.textContent === 'Bekräfta E-postsändning') {
                sendEmailReport();
                confirmationModal.style.display = 'none';
            }
        });
    }

    // Event Listener for Cancel Action Button
    if (cancelActionButton) {
        cancelActionButton.addEventListener('click', closeConfirmationModal);
    }

    // Event Listener for Download Report Button
    if (downloadReportButton) {
        downloadReportButton.addEventListener('click', downloadReportAsPDF);
    }

    // Event Listener for Send Email Report Button
    if (emailReportButton) {
        emailReportButton.addEventListener('click', function() {
            if (!reportSection.dataset.reportText) {
                alert('Generera rapporten först innan du skickar via e-post.');
                return;
            }

            confirmationModal.style.display = 'flex';
            confirmActionButton.focus();

            const modalTitle = document.getElementById('modalTitle');
            const modalDescription = document.getElementById('modalDescription');

            modalTitle.textContent = 'Bekräfta E-postsändning';
            modalDescription.textContent = 'Är du säker på att du vill skicka rapporten via E-post?';
        });
    }

    // Function to initialize form and load existing data
    function initializeForm() {
        if (siteData) {
            generateCameraTestForm(siteData, siteName);
            loadExistingTestResults(siteData, siteName);
        }
    }

    initializeForm();

    // Function to handle removal of cameras
    function handleRemoveCamera(index) {
        if (!siteData || !siteData[siteName] || !siteData[siteName].hardware) return;

        siteData[siteName].hardware.splice(index, 1);

        if (siteData[siteName].testing && siteData[siteName].testing.length > index) {
            siteData[siteName].testing.splice(index, 1);
        }

        localStorage.setItem('siteData', JSON.stringify(siteData));

        displaySiteDetails(siteData, siteName);
        generateCameraTestForm(siteData, siteName);
        loadExistingTestResults(siteData, siteName);
    }

    // Event Delegation for Remove Buttons
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

    // Event Listener to close modal when clicking outside modal-content
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
});
