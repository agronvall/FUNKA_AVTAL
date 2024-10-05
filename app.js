// app.js

document.addEventListener('DOMContentLoaded', function () {
    const siteListContainer = document.getElementById('siteList');
    const toggleButton = document.getElementById('toggleDarkMode');
    const exportButton = document.getElementById('exportButton');
    const body = document.body;
    const fileInput = document.getElementById('fileInput');

    let siteData = {};

    // Function to display the list of sites
    function displaySiteList(siteData) {
        const sites = Object.keys(siteData);
        siteListContainer.innerHTML = ''; // Clear existing list

        if (sites.length === 0) {
            siteListContainer.innerHTML = '<p>Inga siter tillgängliga.</p>';
            return;
        }

        sites.forEach(site => {
            const siteItem = document.createElement('div');
            siteItem.classList.add('site-item');
            siteItem.dataset.site = site;

            const siteName = document.createElement('h3');
            siteName.textContent = site;

            const siteInfo = document.createElement('p');
            siteInfo.textContent = siteData[site].description || 'Ingen beskrivning tillgänglig.';

            siteItem.appendChild(siteName);
            siteItem.appendChild(siteInfo);

            // Add click event to navigate to site.html with site parameter
            siteItem.addEventListener('click', () => {
                window.location.href = `site.html?site=${encodeURIComponent(site)}`;
            });

            siteListContainer.appendChild(siteItem);
        });
    }

    // Function to handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            alert('Ingen fil vald.');
            return;
        }

        // Check file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'json') {
            alert('Vänligen välj en giltig JSON-fil.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                siteData = data;
                // Store data in localStorage
                localStorage.setItem('siteData', JSON.stringify(siteData));
                // Display site list
                displaySiteList(siteData);
                alert('Site data laddad framgångsrikt!');
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Fel: Ogiltig JSON-fil.');
                siteListContainer.innerHTML = '<p>Fel vid tolkning av JSON-filen.</p>';
            }
        };

        reader.onerror = function () {
            console.error('Error reading file.');
            alert('Fel vid läsning av filen.');
            siteListContainer.innerHTML = '<p>Fel vid läsning av filen.</p>';
        };

        reader.readAsText(file);
    }

    // Function to export the current siteData as JSON
    function exportSiteData() {
        if (Object.keys(siteData).length === 0) {
            alert('Ingen site data att exportera.');
            return;
        }

        const dataStr = JSON.stringify(siteData, null, 4);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'site_info_exported.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event listener for file input
    fileInput.addEventListener('change', handleFileSelect);

    // Event listener for export button
    exportButton.addEventListener('click', exportSiteData);

    // Load siteData from localStorage if available
    const storedData = localStorage.getItem('siteData');
    if (storedData) {
        try {
            siteData = JSON.parse(storedData);
            displaySiteList(siteData);
        } catch (error) {
            console.error('Error parsing stored JSON:', error);
            siteListContainer.innerHTML = '<p>Fel vid laddning av sparad site data.</p>';
        }
    }

    // Dark Mode Toggle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                toggleButton.innerHTML = '<i class="fas fa-sun"></i> Ljust Läge';
            } else {
                toggleButton.innerHTML = '<i class="fas fa-moon"></i> Mörkt Läge';
            }
        });
    }
});
