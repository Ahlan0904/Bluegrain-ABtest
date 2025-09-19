import { initializeCommonUI } from './common.js';

/**
 * Fetches and injects a shared HTML layout component.
 * @param {string} placeholderId - The ID of the element to replace with the layout.
 * @param {string} layoutUrl - The URL of the HTML layout file.
 */
async function loadLayout(placeholderId, layoutUrl) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Layout placeholder with ID "${placeholderId}" not found.`);
        return;
    }

    try {
        const response = await fetch(layoutUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch layout: ${response.statusText}`);
        }
        const layoutHTML = await response.text();
        
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = layoutHTML;

        // Inject header into placeholder
        const header = tempDiv.querySelector('header');
        if (header) {
            placeholder.replaceWith(header);
        }

        // Append modals and sidebars to the body
        const otherElements = tempDiv.querySelectorAll('.modal-overlay, .sidebar');
        otherElements.forEach(el => {
            document.body.appendChild(el);
        });

        // Initialize event listeners for the new elements
        initializeCommonUI();

    } catch (error) {
        console.error(`Error loading layout from ${layoutUrl}:`, error);
        placeholder.innerHTML = '<p style="color: red;">오류: 헤더를 불러올 수 없습니다.</p>';
    }
}

// Load the main header and its associated components
loadLayout('header-placeholder', '/src/layout/header-layout.html');