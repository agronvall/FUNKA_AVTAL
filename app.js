// app.js

document.addEventListener('DOMContentLoaded', function() {
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
            siteListContainer.innerHTML = '<p>No sites available.</p>';
            return;
        }

        sites.forEach(site => {
            const siteItem = document.createElement('div');
            siteItem.classList.add('site-item');
            siteItem.dataset.site = site;

            const siteName = document.createElement('span');
            siteName.classList.add('site-name');
            siteName.textContent = site;

            const arrow = document.createElement('span');
            arrow.classList.add('arrow');
            arrow.innerHTML = '&#8594;'; // Right arrow

            siteItem.appendChild(siteName);
            siteItem.appendChild(arrow);

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
            alert('No file selected.');
            return;
        }

        // Check file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'json') {
            alert('Please select a valid JSON file.');
            return;
        }

        console.log(`Selected file: ${file.name}`); // Debugging line

        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('File content:', e.target.result); // Debugging line
            try {
                const data = JSON.parse(e.target.result);
                siteData = data;
                // Store data in localStorage
                localStorage.setItem('siteData', JSON.stringify(siteData));
                // Display site list
                displaySiteList(siteData);
                alert('Site data loaded successfully!');

                // **Debugging: Display JSON content on the page**
                displayJsonContent(e.target.result);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Error: Invalid JSON file.');
                siteListContainer.innerHTML = '<p>Error parsing JSON file.</p>';
            }
        };

        reader.onerror = function() {
            console.error('Error reading file.');
            alert('Error reading file.');
            siteListContainer.innerHTML = '<p>Error reading file.</p>';
        };

        reader.readAsText(file);
    }

    // **New Function: Display JSON content for debugging**
    function displayJsonContent(content) {
        const debugDiv = document.createElement('div');
        debugDiv.style.marginTop = '25px';
        debugDiv.style.padding = '15px';
        debugDiv.style.backgroundColor = '#E2E8F0'; /* Light grey-blue background */
        debugDiv.style.borderRadius = '6px';
        debugDiv.style.overflowX = 'auto';
        debugDiv.style.width = '100%';
        debugDiv.innerHTML = `<h3 style="margin-bottom: 10px;">Loaded JSON Content:</h3><pre style="font-size: 0.95em; line-height: 1.4;">${content}</pre>`;
        siteListContainer.appendChild(debugDiv);
    }

    // Function to export the current siteData as JSON
    function exportSiteData() {
        if (Object.keys(siteData).length === 0) {
            alert('No site data to export.');
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

            // **Debugging: Display stored JSON content on the page**
            displayJsonContent(storedData);
        } catch (error) {
            console.error('Error parsing stored JSON:', error);
            siteListContainer.innerHTML = '<p>Error loading stored site data.</p>';
        }
    }

    // Dark Mode Toggle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
        });
    }
});
