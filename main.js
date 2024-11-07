// ==UserScript==
// @name         No-Mouse web
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds two chars anchors to every interactive element of the page. Shortcut: Ctrl+<
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let elements = [];

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let counter = 0; // to count the sequence AA, AB etc

    function get_prefix(length = 2) {
        let result = '';
        let tempCounter = counter;

        for (let i = 0; i < length; i++) {
            result = characters.charAt(tempCounter % characters.length) + result;
            tempCounter = Math.floor(tempCounter / characters.length);
        }
        counter++;
        return result;
    }
    // Function to check if an element is visible
    function isVisible(element) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        // Check if element has non-zero dimensions and is within the viewport
        return (rect.width > 1 && rect.height > 1 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                rect.top >= 0 && rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }
    // Function to initialize each leaf node by changing the first two characters
    function initializeLeafNodes() {
        const allElements = document.querySelectorAll('*');

        allElements.forEach(e => {
            if (isVisible(e) && ((e.getAttribute('onclick')!=null)||(e.getAttribute('href')!=null)||(e.tagName == "BUTTON"))) { // Only clickable nodes
                if (e.tagName == "DIV") {
                    return;
                }
                elements.push(e)
                e.dataset.originalText = e.innerHTML; // Store original text
                const prefix = get_prefix();
                e.dataset.key = prefix;
                const newDiv = document.createElement("div");
                newDiv.innerHTML = prefix;
                newDiv.style = "font-weight: bold; color: blue;"
                e.prepend(newDiv)
            }            
            if (e.tagName == "INPUT" && e.type == "text" && isVisible(e)) {
                elements.push(e);
                const prefix = get_prefix();
                e.dataset.originalPH = e.placeholder;
                e.placeholder = prefix + e.placeholder;
                e.dataset.key = prefix;
                console.log(e)
            }
        });
    }
    function resetNodes() {
        elements.forEach(e => {
            if (e.tagName == "INPUT" && e.type == "text") {
                e.placeholder = e.dataset.originalPH;
                return;
            }
            e.innerHTML = e.dataset.originalText; // Restore original text
        })
    }
        // Function to simulate a click on an element
    function simulateClick(element) {
        if (element.tagName == "INPUT") {
            element.focus();
        }
        if (element) {
            element.click();
        }
    }

        // Track typed characters
    let typedSequence = '';
    let active = false;
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.altKey && !active) {
            event.preventDefault();
            counter = 0; // reset to reuse AA, AB next call
            typedSequence = '';
            active = true;
            initializeLeafNodes();
            return;
        }
        if (!active) {
            return;
        }

        if (event.key == "Escape" || (event.ctrlKey && event.altKey)) {
            resetNodes();

            typedSequence = "";
            active = false;
            return;
        }
        typedSequence += event.key.toUpperCase();
        event.preventDefault();
        const matchedElement = elements.find(element => {
            return element.dataset.key === typedSequence;
        });

        if (matchedElement) {
            simulateClick(matchedElement);  // Simulate a click on the matched element
            resetNodes();               // Reset all elements to their original text
            typedSequence = '';             // Clear the typed sequence
            active = false;
        } else if (typedSequence.length >= 2) {
            // Limit the typed sequence to 2 characters to match the prefix
            typedSequence = "";
        }
    });


})();
