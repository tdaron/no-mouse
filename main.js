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
    function get_prefix(length = 2) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    // Function to initialize each leaf node by changing the first two characters
    function initializeLeafNodes() {
        const allElements = document.querySelectorAll('*');

        allElements.forEach(e => {
            if ((e.getAttribute('onclick')!=null)||(e.getAttribute('href')!=null)||(e.tagName == "BUTTON")) { // Only clickable nodes
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
            if (e.tagName == "INPUT" && e.type == "text") {
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
        if (event.ctrlKey && event.key === '<' && !active) {
            event.preventDefault();
            typedSequence = '';
            active = true;
            initializeLeafNodes();
            return;
        }
        if (!active) {
            return;
        }

        if (event.key == "Escape") {
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
