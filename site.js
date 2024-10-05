// site.js

document.addEventListener('DOMContentLoaded', function () {
    const siteDetailsContainer = document.getElementById('siteDetails');
    const cameraTestForm = document.getElementById('cameraTestForm');
    const reportSection = document.getElementById('reportSection');
    const reportContent = document.getElementById('reportContent');
    const downloadReportButton = document.getElementById('downloadReportButton');
    const emailReportButton = document.getElementById('emailReportButton');
    const submitButton = document.querySelector('.submit-button');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const addHardwareButton = document.getElementById('addHardwareButton');
    const addHardwareModal = document.getElementById('addHardwareModal');
    const closeModalButton = document.querySelector('.close-button');
    const saveHardwareButton = document.getElementById('saveHardwareButton');
    const newHardwareNameInput = document.getElementById('newHardwareName');

    // Function to show notification
    function showNotification(message) {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

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

        if (site.hardware && Array.isArray(site.hardware) && site.hardware.length > 0) {
            site.hardware.forEach((camera, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('hardware-item');

                const cameraName = document.createElement('span');
                cameraName.textContent = camera.hardware_name || `Kamera ${index + 1}`;

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
        siteDetailsContainer.innerHTML = '<p>Ingen site data hittades. Vänligen ladda site data på huvudsidan.</p>';
    }

    // Function to generate Camera Test Form
    function generateCameraTestForm(siteData, siteName) {
        if (!siteData[siteName] || !siteData[siteName].hardware || siteData[siteName].hardware.length === 0) {
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
            cameraTitle.textContent = camera.hardware_name || `Kamera ${index + 1}`;

            cameraDiv.appendChild(cameraTitle);

            // Functionality Radio Buttons
            const functionalityDiv = document.createElement('div');
            functionalityDiv.classList.add('test-item');

            const fungerarRadio = document.createElement('input');
            fungerarRadio.type = 'radio';
            fungerarRadio.name = `functionality_${index}`;
            fungerarRadio.value = 'Fungerar';
            fungerarRadio.checked = true;
            fungerarRadio.id = `functionality_${index}_fungerar`;

            const fungerarLabel = document.createElement('label');
            fungerarLabel.htmlFor = `functionality_${index}_fungerar`;
            fungerarLabel.textContent = 'Fungerar';

            const fungerarInteRadio = document.createElement('input');
            fungerarInteRadio.type = 'radio';
            fungerarInteRadio.name = `functionality_${index}`;
            fungerarInteRadio.value = 'Fungerar inte';
            fungerarInteRadio.id = `functionality_${index}_fungerarInte`;

            const fungerarInteLabel = document.createElement('label');
            fungerarInteLabel.htmlFor = `functionality_${index}_fungerarInte`;
            fungerarInteLabel.textContent = 'Fungerar inte';

            functionalityDiv.appendChild(fungerarRadio);
            functionalityDiv.appendChild(fungerarLabel);
            functionalityDiv.appendChild(fungerarInteRadio);
            functionalityDiv.appendChild(fungerarInteLabel);

            cameraDiv.appendChild(functionalityDiv);

            // Event listeners to change background color
            fungerarRadio.addEventListener('change', function () {
                if (fungerarRadio.checked) {
                    cameraDiv.classList.remove('red-background');
                }
            });

            fungerarInteRadio.addEventListener('change', function () {
                if (fungerarInteRadio.checked) {
                    cameraDiv.classList.add('red-background');
                }
            });

            // Test criteria
            const testCriteria = [
                { label: 'Samtliga linser besiktigade', name: `samtligaLinser_${index}` },
                { label: 'Ockulär besiktning', name: `ockularBesiktning_${index}` },
                { label: 'Ockulär infrastruktur', name: `ockularInfrastruktur_${index}` }
            ];

            testCriteria.forEach(criteria => {
                const testItem = document.createElement('div');
                testItem.classList.add('test-item');

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
    }

    // Function to generate Report
    function generateReport(siteData, siteName) {
        const cameras = siteData[siteName].hardware;
        let reportHTML = `<h3>Testrapport för Site: ${siteName}</h3><hr/>`;
        let reportText = `Testrapport för Site: ${siteName}\n\n`;

        siteData[siteName].testing = [];

        for (let index = 0; index < cameras.length; index++) {
            const camera = cameras[index];
            const functionality = document.querySelector(`input[name="functionality_${index}"]:checked`);
            const samtligaLinserElem = document.getElementById(`samtligaLinser_${index}`);
            const ockularBesiktningElem = document.getElementById(`ockularBesiktning_${index}`);
            const ockularInfrastrukturElem = document.getElementById(`ockularInfrastruktur_${index}`);
            const commentElem = document.getElementById(`comment_${index}`);

            const testResult = {
                hardware_name: camera.hardware_name || `Kamera ${index + 1}`,
                functionality: functionality ? functionality.value : 'Fungerar',
                samtligaLinser: samtligaLinserElem ? samtligaLinserElem.checked : false,
                ockularBesiktning: ockularBesiktningElem ? ockularBesiktningElem.checked : false,
                ockularInfrastruktur: ockularInfrastrukturElem ? ockularInfrastrukturElem.checked : false,
                comments: commentElem ? commentElem.value.trim() : ''
            };

            siteData[siteName].testing.push(testResult);

            // Update report HTML (full report)
            const cameraNameHTML = testResult.functionality === 'Fungerar inte'
                ? `<span style="color: red;">${testResult.hardware_name}</span>`
                : `${testResult.hardware_name}`;

            reportHTML += `<strong>Kamera: ${cameraNameHTML}</strong><br/>`;
            reportHTML += `- Funktionalitet: ${testResult.functionality}<br/>`;
            reportHTML += `- Samtliga linser besiktigade: ${testResult.samtligaLinser ? '✓' : '✗'}<br/>`;
            reportHTML += `- Ockulär besiktning: ${testResult.ockularBesiktning ? '✓' : '✗'}<br/>`;
            reportHTML += `- Ockulär infrastruktur: ${testResult.ockularInfrastruktur ? '✓' : '✗'}<br/>`;
            reportHTML += `- Kommentarer: ${testResult.comments || 'Ingen kommentar.'}<br/><br/>`;
        }

        localStorage.setItem('siteData', JSON.stringify(siteData));

        reportContent.innerHTML = reportHTML;
        reportSection.style.display = 'block';

        // Prepare email report with only devices that "Fungerar inte"
        let emailReportText = `Rapport för kameror som inte fungerar på Site: ${siteName}\n\n`;

        const nonFunctionalCameras = siteData[siteName].testing.filter(testResult => testResult.functionality === 'Fungerar inte');

        if (nonFunctionalCameras.length === 0) {
            emailReportText += 'Alla kameror fungerar.\n';
        } else {
            nonFunctionalCameras.forEach(testResult => {
                emailReportText += `Kamera: ${testResult.hardware_name}\n`;
                emailReportText += `Kommentarer: ${testResult.comments || 'Ingen kommentar.'}\n\n`;
            });
        }

        // Store email report text for sending via email
        reportSection.dataset.emailReportText = emailReportText;

        showNotification('Rapport genererad!');
    }

    // Function to load existing test results
    function loadExistingTestResults(siteData, siteName) {
        if (!siteData[siteName].testing) return;

        const cameras = siteData[siteName].hardware;

        cameras.forEach((camera, index) => {
            const testResult = siteData[siteName].testing[index];
            if (testResult) {
                const fungerarRadio = document.querySelector(`input[name="functionality_${index}"][value="${testResult.functionality}"]`);
                if (fungerarRadio) fungerarRadio.checked = true;

                const fungerarInteRadio = document.querySelector(`input[name="functionality_${index}"][value="Fungerar inte"]`);
                const cameraDiv = document.querySelectorAll('.camera-item')[index];

                // Update background color based on functionality
                if (testResult.functionality === 'Fungerar inte') {
                    cameraDiv.classList.add('red-background');
                } else {
                    cameraDiv.classList.remove('red-background');
                }

                const samtligaLinserElem = document.getElementById(`samtligaLinser_${index}`);
                const ockularBesiktningElem = document.getElementById(`ockularBesiktning_${index}`);
                const ockularInfrastrukturElem = document.getElementById(`ockularInfrastruktur_${index}`);
                const commentElem = document.getElementById(`comment_${index}`);

                if (samtligaLinserElem) samtligaLinserElem.checked = testResult.samtligaLinser;
                if (ockularBesiktningElem) ockularBesiktningElem.checked = testResult.ockularBesiktning;
                if (ockularInfrastrukturElem) ockularInfrastrukturElem.checked = testResult.ockularInfrastruktur;
                if (commentElem) commentElem.value = testResult.comments;
            }
        });
    }

    // Function to download report as PDF using html2pdf.js
    function downloadReportAsPDF() {
        const reportElement = document.getElementById('reportContent');

        const options = {
            margin:       [10, 10, 10, 10], // top, left, bottom, right
            filename:     `Testrapport_${siteName}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Use 'avoid-all' to prevent breaking inside elements
        };

        html2pdf().set(options).from(reportElement).save()
            .then(() => {
                showNotification('PDF nedladdad!');
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                alert('Det uppstod ett fel vid generering av PDF-rapporten.');
            });
    }

    // Function to send email report via mailto:
    function sendEmailReport() {
        const userEmail = prompt('Ange mottagarens e-postadress:');
        if (!userEmail) {
            alert('E-postadress krävs för att skicka rapporten.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userEmail)) {
            alert('Vänligen ange en giltig e-postadress.');
            return;
        }

        const subject = `Testrapport för Site: ${siteName}`;
        const emailText = reportSection.dataset.emailReportText;

        if (!emailText) {
            alert('Ingen rapport att skicka. Generera rapporten först.');
            return;
        }

        // Encode email content
        const formattedBody = encodeURIComponent(emailText);

        // Prepare mailto link
        const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${formattedBody}`;

        // Open mail client
        window.location.href = mailtoLink;

        showNotification('E-postlänk öppnad!');
    }

    // Event Listener for Submit Button
    submitButton.addEventListener('click', function () {
        generateReport(siteData, siteName);
    });

    // Event Listener for Download Report Button
    if (downloadReportButton) {
        downloadReportButton.addEventListener('click', downloadReportAsPDF);
    }

    // Event Listener for Send Email Report Button
    if (emailReportButton) {
        emailReportButton.addEventListener('click', sendEmailReport);
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

        showNotification('Kamera borttagen!');
    }

    // Event Delegation for Remove Buttons
    siteDetailsContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('remove-button')) {
            const index = parseInt(event.target.dataset.index, 10);
            if (isNaN(index)) {
                console.error('Invalid index for removal.');
                return;
            }
            const cameraName = siteData[siteName].hardware[index].hardware_name || `Kamera ${index + 1}`;
            if (confirm(`Är du säker på att du vill ta bort kameran "${cameraName}"?`)) {
                handleRemoveCamera(index);
            }
        }
    });

    // Add Hardware Modal Functionality
    addHardwareButton.addEventListener('click', function () {
        addHardwareModal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', function () {
        addHardwareModal.style.display = 'none';
        newHardwareNameInput.value = '';
    });

    window.addEventListener('click', function (event) {
        if (event.target == addHardwareModal) {
            addHardwareModal.style.display = 'none';
            newHardwareNameInput.value = '';
        }
    });

    saveHardwareButton.addEventListener('click', function () {
        const newHardwareName = newHardwareNameInput.value.trim();
        if (!newHardwareName) {
            alert('Vänligen ange ett namn för hårdvaran.');
            return;
        }

        if (!siteData[siteName].hardware) {
            siteData[siteName].hardware = [];
        }

        siteData[siteName].hardware.push({ hardware_name: newHardwareName });

        localStorage.setItem('siteData', JSON.stringify(siteData));

        displaySiteDetails(siteData, siteName);
        generateCameraTestForm(siteData, siteName);
        loadExistingTestResults(siteData, siteName);

        addHardwareModal.style.display = 'none';
        newHardwareNameInput.value = '';

        showNotification('Hårdvara tillagd!');
    });
});
