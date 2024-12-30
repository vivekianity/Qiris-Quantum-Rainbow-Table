document.addEventListener("DOMContentLoaded", function() {
    const texts = [
        "Let us first create a rainbow table.",
        "Add as many text values as you want to create your chains."
    ];
    const textElements = ["inputTableTitle", "createTableDescription"];

    typeText(textElements[0], texts[0], 25, () => {
        typeText(textElements[1], texts[1], 25, () => {
            showElementsSequentially([
                ['rainbowTableContainer'], 
                ['inputMethodButtons']
            ], stepDelay);
        });
    });

    document.getElementById("startLiveFeedButton").addEventListener("click", startLiveFeed);
    document.getElementById("rainbowForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const initialWord = document.getElementById("initialWord").value;
        addUserEntry(initialWord);
        document.getElementById("initialWord").value = "";
    });
    document.getElementById("searchForm").addEventListener("submit", searchHash);
    document.getElementById("searchHash").addEventListener("input", function() {
        this.setCustomValidity("");
    });
    document.getElementById("uploadButton").addEventListener("click", uploadTable);
    document.getElementById("downloadButton").addEventListener("click", downloadTable);
    document.getElementById("nextButton").addEventListener("click", continueSearch);

    document.getElementById("manualInputButton").addEventListener("click", () => {
        showForm("rainbowForm");
    });
    document.getElementById("randomInputButton").addEventListener("click", () => {
        showForm("randomGenForm");
    });
    document.getElementById("fileUploadButton").addEventListener("click", () => {
        showForm("buttonContainer");
    });
    document.getElementById("valueCount").addEventListener("change", function() {
        showElement("startLiveFeedButton");
        showCreateTableDescription2();
    });
    document.getElementById("live-feed-table-body").addEventListener("click", function(event) {
        if (event.target.classList.contains('copyable-hash')) {
            const fullHash = event.target.getAttribute('data-full-hash');
            if (fullHash) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(fullHash).then(() => {
                        showFlashMessage('Hash copied to clipboard');
                        event.target.style.backgroundColor = '#d4edda';
                        setTimeout(() => {
                            event.target.style.backgroundColor = '';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy hash using clipboard API: ', err);
                        fallbackCopyTextToClipboard(fullHash, event.target);
                    });
                } else {
                    fallbackCopyTextToClipboard(fullHash, event.target);
                }
            }
        }
    });

    hideElement("inputMethodButtons");
    hideSection("searchSection");
    hideSection("live-feed");
    hideElement("liveChainDescription");
    hideElement("live-feed-title");
    hideElement("searchResultsTableHead");
    hideElement("searchResults");
    hideElement("rainbowTableContainer");
    hideElement("rainbowForm");
    hideElement("buttonContainer");
    hideElement("startLiveFeedButton");
    hideElement("randomGenForm");
});

let allEntries = [];
const stepDelay = 1000;
let searchStep = 0;
let globalHash = "";
const nextButtonTexts = [
    "Assuming the hash is from the <b><u>4<sup>th</sup> MD5 hash column</u></b>:<br>1. Apply Reduction Function 4 to the hash.<br>2. Search the result in the end chains of the rainbow table.<br><br>If no match is found, the assumption is wrong.",
    "Assuming the hash is from the <b><u>3<sup>rd</sup> MD5 hash column</u></b>:<br>1. Apply Reduction Function 3 to the original hash.<br>2. Hash the result.<br>3. Apply Reduction Function 4.<br>4. Search the result in the end chains.<br><br>If no match is found, the assumption is wrong.",
    "Assuming the hash is from the <b><u>2<sup>nd</sup> MD5 hash column</u></b>:<br>1. Apply Reduction Function 2 to the original hash.<br>2. Hash the result.<br>3. Apply Reduction Function 3.<br>4. Hash the result again.<br>5. Apply Reduction Function 4.<br>6. Search the result in the end chains.<br><br>If no match is found, the assumption is wrong.",
    "Assuming the hash is from the <b><u>1<sup>st</sup> MD5 hash column</u></b>:<br>1. Apply Reduction Function 1 to the original hash.<br>2. Hash the result.<br>3. Apply Reduction Function 2.<br>4. Hash the result again.<br>5. Apply Reduction Function 3.<br>6. Hash the result again.<br>7. Apply Reduction Function 4.<br>8. Search the result in the end chains.<br><br>If no match is found, the hash cannot be found in the rainbow table."
];

function fallbackCopyTextToClipboard(text, targetElement) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Prevent the text area from being visible
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        showFlashMessage('Hash copied to clipboard');
        targetElement.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            targetElement.style.backgroundColor = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy hash using fallback method: ', err);
    }

    document.body.removeChild(textArea);
}

function updateSearchRowHighlight(index, rowIndex, result) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const row = searchResultsBody.rows[index];
    row.cells[2].innerText = result || "";
    row.classList.add('highlight-match');

    const userTable = document.getElementById("userRainbowTable").getElementsByTagName("tbody")[0];
    const matchedRow = userTable.rows[rowIndex];
    matchedRow.classList.add('highlight-match');
}

function highlightEndChainCells(searchValue, callback) {
    const table = document.getElementById("userRainbowTable").getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    let currentRow = 0;

    function highlightNextRow() {
        if (currentRow >= rows.length) {
            callback(false);
            return;
        }

        const endChainCell = rows[currentRow].cells[1];
        endChainCell.classList.add('highlight');

        if (endChainCell.innerText === searchValue) {
            endChainCell.classList.add('match');
            callback(true, currentRow);
            return;
        }

        setTimeout(() => {
            endChainCell.classList.remove('highlight');
            currentRow++;
            setTimeout(highlightNextRow, 1000);
        }, 1000);
    }

    highlightNextRow();
}

function continueSearch() {
    hideElement("nextButton");
    hideElement("nextButtonText");
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const searchResultsHead = document.getElementById("searchResultsTableHead");
    const nextButtonText = document.getElementById("nextButtonText");

    switch (searchStep) {
        case 1:
            searchResultsBody.innerHTML = "";
            searchResultsHead.innerHTML = `
                <tr>
                    <th>Hash</th>
                    <th>3<sup>rd</sup> Reduction</th>
                    <th>4<sup>th</sup> Hash</th>
                    <th>4<sup>th</sup> Reduction</th>
                    <th>Result</th>
                </tr>
            `;
            addSearchRowForThirdColumn(globalHash);
            break;
        case 2:
            searchResultsBody.innerHTML = "";
            searchResultsHead.innerHTML = `
                <tr>
                    <th>Hash</th>
                    <th>2<sup>nd</sup> Reduction</th>
                    <th>3<sup>rd</sup> Hash</th>
                    <th>3<sup>rd</sup> Reduction</th>
                    <th>4<sup>th</sup> Hash</th>
                    <th>4<sup>th</sup> Reduction</th>
                    <th>Result</th>
                </tr>
            `;
            addSearchRowForSecondColumn(globalHash);
            break;
        case 3:
            searchResultsBody.innerHTML = "";
            searchResultsHead.innerHTML = `
                <tr>
                    <th>Hash</th>
                    <th>1<sup>st</sup> Reduction</th>
                    <th>2<sup>nd</sup> Hash</th>
                    <th>2<sup>nd</sup> Reduction</th>
                    <th>3<sup>rd</sup> Hash</th>
                    <th>3<sup>rd</sup> Reduction</th>
                    <th>4<sup>th</sup> Hash</th>
                    <th>4<sup>th</sup> Reduction</th>
                    <th>Result</th>
                </tr>
            `;
            addSearchRowForFirstColumn(globalHash);
            break;
    }
    nextButtonText.innerHTML = nextButtonTexts[searchStep];
    showElement("nextButton");
    showElement("nextButtonText");
}

function showForm(formId) {
    hideElement("rainbowForm");
    hideElement("randomGenForm");
    hideElement("buttonContainer");

    hideElement("inputMethodButtons");

    showElement(formId);
}

function showElementsSequentially(elements, delay = stepDelay) {
    elements.reduce((promise, elementId) => {
        if (Array.isArray(elementId)) {
            return promise.then(() => {
                elementId.forEach(id => {
                    showElement(id);
                    document.getElementById(id).classList.add('fade-in');
                });
                return new Promise((resolve) => setTimeout(resolve, delay));
            });
        } else {
            return promise.then(() => {
                showElement(elementId);
                document.getElementById(elementId).classList.add('fade-in');
                return new Promise((resolve) => setTimeout(resolve, delay));
            });
        }
    }, Promise.resolve());
}

function typeText(elementId, text, delay, callback) {
    const element = document.getElementById(elementId);
    element.innerHTML = "";
    let index = 0;

    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, delay);
        } else if (callback) {
            callback();
        }
    }

    type();
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add("hidden");
    }
}

function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove("hidden");
}

function hideSection(sectionId) {
    document.getElementById(sectionId).classList.add("hidden");
}

function generateRandomText(length) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function showCreateTableDescription2() {
    const newText = "When you are ready, click the Start button. The chains will be generated for you live.";
    const newElementId = "createTableDescription2";

    showElement(newElementId);
    typeText(newElementId, newText, 25);
}

function addUserEntry(initialWord) {
    const table = document.getElementById("userRainbowTable").getElementsByTagName('tbody')[0];
    const existingRow = table.querySelector('tr td.start-of-chain:empty');
    let newRow;

    if (existingRow) {
        newRow = existingRow.parentNode;
        showElement("startLiveFeedButton");
    } else {
        newRow = table.insertRow();
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        cell1.className = 'start-of-chain';
        cell2.className = 'end-of-chain';
    }

    newRow.cells[0].textContent = initialWord;
    newRow.cells[1].textContent = '';

    if (table.rows.length === 1) {
        showCreateTableDescription2()
    }
}

function startLiveFeed() {
    const valueCount = parseInt(document.getElementById("valueCount").value);
    const table = document.getElementById("userRainbowTable").getElementsByTagName('tbody')[0];
    const currentEntries = table.rows.length;

    if (valueCount != 0) {
        for (let i = currentEntries; i < valueCount + 1; i++) {
            const randomText = generateRandomText(10);
            addUserEntry(randomText);
        }
    }

    hideElement("inputTableTitle");
    hideElement("createTableDescription");
    hideElement("rainbowForm");
    hideElement("buttonContainer");

    const searchDescriptionText = "Search for a hash in the created rainbow table to see if it matches any of the chains. Click on a hash in the Live Chain Creation Table to copy it to clipboard.";
    const searchDescriptionElementId = "searchDescription";

    hideElement("addButton");
    hideElement("startLiveFeedButton");

    hideElement("createTableDescription2");
    hideElement("initialWord");
    hideElement("randomGenForm");

    showElement("rainbowTableHeader");

    showElement("live-feed-title");
    showSection("live-feed");
    showElement("liveChainDescription");

    let currentRow = 0;

    function updateLiveFeed() {
        if (currentRow >= table.rows.length) {
            document.getElementById("startLiveFeedButton").disabled = false;
            showSection("searchSection");
            typeText(searchDescriptionElementId, searchDescriptionText, 25);
            return;
        }

        const initialPlaintext = table.rows[currentRow].cells[0].innerText;
        const liveFeedBody = document.getElementById("live-feed-table-body");

        const newRow = document.createElement("tr");
        const columns = [
            "initial-plaintext", "first-md5-hash", "first-reduction",
            "second-md5-hash", "second-reduction", "third-md5-hash",
            "third-reduction", "fourth-md5-hash", "fourth-reduction"
        ];

        columns.forEach(column => {
            const cell = document.createElement("td");
            cell.id = column;
            newRow.appendChild(cell);
        });

        liveFeedBody.appendChild(newRow);

        let currentPlaintext = initialPlaintext;
        let currentHash = hashFunction(currentPlaintext);

        function updateCell(column, value, fullHash) {
            const cell = newRow.querySelector(`#${column}`);
            if (cell) {
                cell.innerText = value;
                if (fullHash) {
                    cell.setAttribute('data-full-hash', fullHash);
                    cell.classList.add('copyable-hash');
                }
            }
        }

        updateCell("initial-plaintext", currentPlaintext);
        updateCell("first-md5-hash", "Hashing...");

        setTimeout(() => {
            currentHash = hashFunction(currentPlaintext);
            updateCell("first-md5-hash", shortenHash(currentHash), currentHash);
            updateCell("first-reduction", "Reducing...");
            currentPlaintext = reductionFunction1(currentHash);

            setTimeout(() => {
                updateCell("first-reduction", currentPlaintext);
                updateCell("second-md5-hash", "Hashing...");
                currentHash = hashFunction(currentPlaintext);

                setTimeout(() => {
                    updateCell("second-md5-hash", shortenHash(currentHash), currentHash);
                    updateCell("second-reduction", "Reducing...");
                    currentPlaintext = reductionFunction2(currentHash);

                    setTimeout(() => {
                        updateCell("second-reduction", currentPlaintext);
                        updateCell("third-md5-hash", "Hashing...");
                        currentHash = hashFunction(currentPlaintext);

                        setTimeout(() => {
                            updateCell("third-md5-hash", shortenHash(currentHash), currentHash);
                            updateCell("third-reduction", "Reducing...");
                            currentPlaintext = reductionFunction3(currentHash);

                            setTimeout(() => {
                                updateCell("third-reduction", currentPlaintext);
                                updateCell("fourth-md5-hash", "Hashing...");
                                currentHash = hashFunction(currentPlaintext);

                                setTimeout(() => {
                                    updateCell("fourth-md5-hash", shortenHash(currentHash), currentHash);
                                    updateCell("fourth-reduction", "Reducing...");
                                    currentPlaintext = reductionFunction4(currentHash);

                                    setTimeout(() => {
                                        updateCell("fourth-reduction", currentPlaintext);
                                        animateToEndOfChain(currentPlaintext, currentRow);
                                        currentRow++;
                                        setTimeout(updateLiveFeed, stepDelay);
                                    }, stepDelay);
                                }, stepDelay);
                            }, stepDelay);
                        }, stepDelay);
                    }, stepDelay);
                }, stepDelay);
            }, stepDelay);
        }, stepDelay);
    }

    document.getElementById("startLiveFeedButton").disabled = true;
    updateLiveFeed();
}

function hashFunction(plaintext) {
    const hash = CryptoJS.MD5(plaintext).toString();
    return hash;
}

function shortenHash(hash) {
    return "..." + hash.slice(-5);
}

function reductionFunction1(md5_hash) {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const char_len = characters.length;
    let hash_int = parseInt(md5_hash.substring(0, 8), 16) + 2;
    let plaintext = "";
    for (let i = 0; i < 6; i++) {
        plaintext += characters[hash_int % char_len];
        hash_int = Math.floor(hash_int / char_len);
    }
    return plaintext;
}

function reductionFunction2(md5_hash) {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const char_len = characters.length;
    let hash_int = parseInt(md5_hash.substring(0, 8), 16) + 3;
    let plaintext = "";
    for (let i = 0; i < 4; i++) {
        plaintext += characters[hash_int % char_len];
        hash_int = Math.floor(hash_int / char_len);
    }
    return plaintext;
}

function reductionFunction3(md5_hash) {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const char_len = characters.length;
    let hash_int = parseInt(md5_hash.substring(0, 8), 16) + 4;
    let plaintext = "";
    for (let i = 0; i < 5; i++) {
        plaintext += characters[hash_int % char_len];
        hash_int = Math.floor(hash_int / char_len);
    }
    return plaintext;
}

function reductionFunction4(md5_hash) {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const char_len = characters.length;
    let hash_int = parseInt(md5_hash.substring(0, 8), 16) + 1;
    let plaintext = "";
    for (let i = 0; i < 3; i++) {
        plaintext += characters[hash_int % char_len];
        hash_int = Math.floor(hash_int / char_len);
    }
    return plaintext;
}

function searchHash(event) {
    event.preventDefault();
    const searchHashInput = document.getElementById("searchHash");
    const searchHashValue = searchHashInput.value.trim();

    const md5Regex = /^[a-fA-F0-9]{32}$/;

    if (!md5Regex.test(searchHashValue)) {
        searchHashInput.setCustomValidity("Invalid MD5 hash input. Please enter a valid 32-character MD5 hash.");
        searchHashInput.reportValidity();
        return;
    } else {
        searchHashInput.setCustomValidity("");
    }
    const nextButtonText = document.getElementById("nextButtonText");
    performSearch(searchHashValue);
    nextButtonText.innerHTML = nextButtonTexts[0];
    showElement("nextButtonText");
    showElement("nextButton");
}

function showFlashMessage(message) {
    const flashMessage = document.getElementById("flashMessage");
    if (flashMessage) {
        flashMessage.textContent = message;
        flashMessage.classList.remove("hidden");
        flashMessage.classList.add("show");

        setTimeout(() => {
            flashMessage.classList.remove("show");
            flashMessage.classList.add("hidden");
        }, 3000);
    }
}

function performSearch(hash) {
    globalHash = hash;
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const searchResultsHead = document.getElementById("searchResultsTableHead");
    searchResultsBody.innerHTML = "";

    setTimeout(() => {
        searchResultsHead.innerHTML = `
            <tr>
                <th>Hash</th>
                <th>4<sup>th</sup> Reduction</th>
                <th>Result</th>
            </tr>
        `;
        showElement("searchResultsTableHead");
        showElement("searchResults");

        addSearchRow(hash, "Reducing...", "");

        setTimeout(() => {
            const reducedValue = reductionFunction4(hash);
            updateSearchRow(0, reducedValue, "");
            setTimeout(() => {
                checkEndChains(reducedValue, (isMatchFound, rowIndex) => {
                    if (isMatchFound) {
                        updateSearchRow(0, reducedValue, "Success: Match found!");
                        updateSearchRowHighlight(0, rowIndex, "Success: Match found!");
                        hideElement("nextButton");
                    } else {
                        updateSearchRow(0, reducedValue, "No match found.");
                        setTimeout(() => {
                            showElement("nextButton");
                            searchStep = 1;
                        }, 1000);
                    }
                });
            }, 1000);
        }, 1000);
    }, 0);
}

function addSearchRow(hash, reduction, result) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const newRow = document.createElement("tr");
    const printHash = shortenHash(hash);
    newRow.innerHTML = `
        <td>${printHash}</td>
        <td>${reduction}</td>
        <td>${result}</td>
    `;
    searchResultsBody.appendChild(newRow);
}

function updateSearchRow(index, reduction, result) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const row = searchResultsBody.rows[index];
    row.cells[1].innerText = reduction;
    row.cells[2].innerText = result || "";
}

function addSearchRowForThirdColumn(hash) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const newRow = document.createElement("tr");
    printHash = shortenHash(hash)
    newRow.innerHTML = `
        <td>${printHash}</td>
        <td>Reducing...</td>
        <td></td>
        <td></td>
        <td></td>
    `;
    searchResultsBody.appendChild(newRow);

    setTimeout(() => {
        const reducedValue3 = reductionFunction3(hash);
        updateSearchRowForThirdColumn(0, reducedValue3, "Hashing...", "", "");

        setTimeout(() => {
            const md5Hash = hashFunction(reducedValue3);
            updateSearchRowForThirdColumn(0, reducedValue3, shortenHash(md5Hash), "Reducing...", "");

            setTimeout(() => {
                const reducedValue4 = reductionFunction4(md5Hash);
                updateSearchRowForThirdColumn(0, reducedValue3, shortenHash(md5Hash), reducedValue4, "");
                setTimeout(() => {
                    checkEndChains(reducedValue4, (isMatchFound, rowIndex) => {
                        if (isMatchFound) {
                            updateSearchRowForThirdColumn(0, reducedValue3, shortenHash(md5Hash), reducedValue4, "Success: Match found!");
                            updateSearchRowHighlight(0, rowIndex, "Success: Match found!");
                            hideElement("nextButton");
                        } else {
                            updateSearchRowForThirdColumn(0, reducedValue3, shortenHash(md5Hash), reducedValue4, "No match found.");
                            showElement("nextButton");
                            searchStep = 2;
                        }
                    });
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

function updateSearchRowForThirdColumn(index, reduction3, md5Hash, reduction4, result) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const row = searchResultsBody.rows[index];
    row.cells[1].innerText = reduction3;
    row.cells[2].innerText = md5Hash;
    row.cells[3].innerText = reduction4;
    row.cells[4].innerText = result || "";
}

function addSearchRowForSecondColumn(hash) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const newRow = document.createElement("tr");
    printHash = shortenHash(hash)
    newRow.innerHTML = `
        <td>${printHash}</td>
        <td>Reducing...</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    `;
    searchResultsBody.appendChild(newRow);

    setTimeout(() => {
        const reducedValue2 = reductionFunction2(hash);
        updateSearchRowForSecondColumn(0, reducedValue2, "Hashing...", "", "", "", "");

        setTimeout(() => {
            const md5Hash3 = hashFunction(reducedValue2);
            updateSearchRowForSecondColumn(0, reducedValue2, shortenHash(md5Hash3), "Reducing...", "", "", "");

            setTimeout(() => {
                const reducedValue3 = reductionFunction3(md5Hash3);
                updateSearchRowForSecondColumn(0, reducedValue2, shortenHash(md5Hash3), reducedValue3, "Hashing...", "", "");

                setTimeout(() => {
                    const md5Hash4 = hashFunction(reducedValue3);
                    updateSearchRowForSecondColumn(0, reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), "Reducing...", "");

                    setTimeout(() => {
                        const reducedValue4 = reductionFunction4(md5Hash4);
                        updateSearchRowForSecondColumn(0, reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), reducedValue4, "");

                        setTimeout(() => {
                            checkEndChains(reducedValue4, (isMatchFound, rowIndex) => {
                                if (isMatchFound) {
                                    updateSearchRowForSecondColumn(0, reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), reducedValue4, "Success: Match found!");
                                    updateSearchRowHighlight(0, rowIndex, "Success: Match found!");
                                    hideElement("nextButton");
                                } else {
                                    updateSearchRowForSecondColumn(0, reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), reducedValue4, "No match found.");
                                    setTimeout(() => {
                                        showElement("nextButton");
                                        searchStep = 3;
                                    }, 1000);
                                }
                            });
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

function updateSearchRowForSecondColumn(index, reduction2, md5Hash3, reduction3, md5Hash4, reduction4, result) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const row = searchResultsBody.rows[index];
    row.cells[1].innerText = reduction2;
    row.cells[2].innerText = md5Hash3;
    row.cells[3].innerText = reduction3;
    row.cells[4].innerText = md5Hash4;
    row.cells[5].innerText = reduction4;
    row.cells[6].innerText = result || "";
}

function addSearchRowForFirstColumn(hash) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const newRow = document.createElement("tr");
    const nextButtonText = document.getElementById("nextButtonText");
    printHash = shortenHash(hash)
    newRow.innerHTML = `
        <td>${printHash}</td>
        <td>Reducing...</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    `;
    searchResultsBody.appendChild(newRow);

    setTimeout(() => {
        const reducedValue1 = reductionFunction1(hash);
        updateSearchRowForFirstColumn(0, reducedValue1, "Hashing...", "", "", "", "", "", "");

        setTimeout(() => {
            const md5Hash2 = hashFunction(reducedValue1);
            updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), "Reducing...", "", "", "", "", "");

            setTimeout(() => {
                const reducedValue2 = reductionFunction2(md5Hash2);
                updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, "Hashing...", "", "", "", "");

                setTimeout(() => {
                    const md5Hash3 = hashFunction(reducedValue2);
                    updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, shortenHash(md5Hash3), "Reducing...", "", "");

                    setTimeout(() => {
                        const reducedValue3 = reductionFunction3(md5Hash3);
                        updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, shortenHash(md5Hash3), reducedValue3, "Hashing...", "");

                        setTimeout(() => {
                            const md5Hash4 = hashFunction(reducedValue3);
                            updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), "Reducing...", "");

                            setTimeout(() => {
                                const reducedValue4 = reductionFunction4(md5Hash4);
                                updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), reducedValue4, "");

                                setTimeout(() => {
                                    checkEndChains(reducedValue4, (isMatchFound, rowIndex) => {
                                        if (isMatchFound) {
                                            updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), reducedValue4, "Success: Match found!");
                                            updateSearchRowHighlight(0, rowIndex, "Success: Match found!");
                                            hideElement("nextButton");
                                        } else {
                                            updateSearchRowForFirstColumn(0, reducedValue1, shortenHash(md5Hash2), reducedValue2, shortenHash(md5Hash3), reducedValue3, shortenHash(md5Hash4), reducedValue4, "No match found.");
                                            hideElement("nextButton");
                                        }
                                    });
                                }, 1000);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

function updateSearchRowForFirstColumn(index, reduction1, md5Hash2, reduction2, md5Hash3, reduction3, md5Hash4, reduction4, result) {
    const searchResultsBody = document.getElementById("searchResultsTableBody");
    const row = searchResultsBody.rows[index];
    row.cells[1].innerText = reduction1;
    row.cells[2].innerText = md5Hash2;
    row.cells[3].innerText = reduction2;
    row.cells[4].innerText = md5Hash3;
    row.cells[5].innerText = reduction3;
    row.cells[6].innerText = md5Hash4;
    row.cells[7].innerText = reduction4;
    row.cells[8].innerText = result || "";
}

function checkEndChains(value, callback) {
    highlightEndChainCells(value, callback);
}

function animateToEndOfChain(value, rowIndex) {
    const reductionCell = document.querySelector(`#live-feed-table-body tr:nth-child(${rowIndex + 1}) td#fourth-reduction`);
    const endOfChainCell = document.querySelector(`#userRainbowTable tbody tr:nth-child(${rowIndex + 1}) .end-of-chain`);

    if (reductionCell && endOfChainCell) {
        const clone = reductionCell.cloneNode(true);
        const rect1 = reductionCell.getBoundingClientRect();
        const rect2 = endOfChainCell.getBoundingClientRect();

        clone.style.position = 'absolute';
        clone.style.left = `${rect1.left + rect1.width / 2 - reductionCell.offsetWidth / 10}px`;
        clone.style.top = `${rect1.top + rect1.height / 2 - reductionCell.offsetHeight / 1}px`;
        clone.style.transition = 'all 1.5s ease-in-out';
        clone.classList.add('floating-cell', 'no-border');
        document.body.appendChild(clone);

        setTimeout(() => {
            clone.style.left = `${rect2.left + rect2.width / 2 - clone.offsetWidth / 2}px`;
            clone.style.top = `${rect2.top + rect2.height / 1 - clone.offsetHeight / 2}px`;
        }, 100);

        setTimeout(() => {
            endOfChainCell.innerText = value;
            document.body.removeChild(clone);
        }, 1600);
    }
}

function uploadTable() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt";
    fileInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const lines = content.split('\n');
                const table = document.getElementById("userRainbowTable").getElementsByTagName("tbody")[0];
                table.innerHTML = "";
                const initialEntries = lines.slice(0, 5);
                allEntries = lines;

                initialEntries.forEach(line => {
                    addUserEntry(line.trim());
                });

                document.getElementById("downloadButton").disabled = false;
                showElement("startLiveFeedButton");
                showElement("downloadButton");
            };
            reader.readAsText(file);
        }
    });
    fileInput.click();
}

function downloadTable() {
    document.getElementById("downloadButton").disabled = true;

    const results = [];
    allEntries.forEach((entry, index) => {
        const startOfChain = entry.trim();
        let currentPlaintext = startOfChain;
        let currentHash = hashFunction(currentPlaintext);

        currentPlaintext = reductionFunction1(currentHash);
        currentHash = hashFunction(currentPlaintext);
        currentPlaintext = reductionFunction2(currentHash);
        currentHash = hashFunction(currentPlaintext);
        currentPlaintext = reductionFunction3(currentHash);
        currentHash = hashFunction(currentPlaintext);
        currentPlaintext = reductionFunction4(currentHash);

        results.push({ start: startOfChain, end: currentPlaintext });

        if (index === allEntries.length - 1) {
            const blob = new Blob([results.map(result => `${result.start} | ${result.end}`).join('\n')], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "rainbow_table_results.txt";
            a.click();
            URL.revokeObjectURL(url);

            document.getElementById("downloadButton").disabled = false;
        }
    });
}
