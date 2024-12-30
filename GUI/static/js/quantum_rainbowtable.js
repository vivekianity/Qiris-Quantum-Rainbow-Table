const items = ['piL', 'RpV', '4dy', 'zTU', 'J8r', 'sm3', '9U3', '8xG', 'OPb', 'Aoj',
               'Twe', 'WnM', 'dzV', 'VQD', 'eXo', '8JX', 'D6C', 'uo6', 'xnb', 'qCt'];

function distributeItems() {
    const bucketsContainer = document.getElementById('bucketsContainer');
    const calculationDisplay = document.getElementById('calculationDisplay');
    bucketsContainer.innerHTML = ''; // Clear previous buckets

    const buckets = {}; // Object to store buckets by index
    const bitSize = 4; // Since 2^4 = 16 buckets

    // Process each item with a delay
    items.forEach((item, index) => {
        setTimeout(() => {
            let sumNumber = 0;
            for (let char of item) {
                sumNumber += char.charCodeAt(0); // Adds the ASCII value of each character
            }
            const remainder = sumNumber % (2 ** bitSize);
            calculationDisplay.innerHTML = `Processing: ${item} <br>
                                            Total ASCII Sum: ${sumNumber} <br>
                                            Next use the Total ASCII SUM mod by the number of bucket size to determine which bucket to input. <br>
                                            ${sumNumber} % 16 = ${remainder} <br>
                                            Bucket Index: ${remainder}`;

            // Check if the bucket exists, if not create it
            if (!buckets[remainder]) {
                const bucket = document.createElement('div');
                bucket.classList.add('bucket');
                const bucketLabel = document.createElement('div');
                bucketLabel.textContent = `Bucket ${remainder}`;
                bucketLabel.style.fontWeight = 'bold';
                bucket.appendChild(bucketLabel);
                buckets[remainder] = bucket;

                // Insert the bucket in the correct order
                insertBucketInOrder(bucketsContainer, bucket, remainder);
            }

            const itemElem = document.createElement('span');
            itemElem.textContent = item;
            itemElem.classList.add('character');
            buckets[remainder].appendChild(itemElem);

            // Add animation (if any)
            anime({
                targets: itemElem,
                opacity: [0, 1],
                translateY: [-50, 0],
                easing: 'easeInOutQuad'
            });

        }, index * 1500);
    });

}

// Function to insert bucket in the correct order
function insertBucketInOrder(container, bucket, index) {
    const existingBuckets = Array.from(container.children);
    const insertBeforeBucket = existingBuckets.find(b => {
        const label = b.querySelector('div').textContent;
        const bucketIndex = parseInt(label.replace('Bucket ', ''));
        return bucketIndex > index;
    });
    if (insertBeforeBucket) {
        container.insertBefore(bucket, insertBeforeBucket);
    } else {
        container.appendChild(bucket);
    }
}

const permutation_16bit = [283,346,331,360,277,361,378,348,369,375,310,207,0,330,357,213,351,271,45,373,347,201,230,300,18,291,131,46,243,390,55,392,429,398,1,210,313,101,314,161,273,444,95,365,41,443,106,363,65,66,185,374,341,10,379,121,152,380,432,311,163,198,318,453,200,125,150,504,194,410,456,256,64,16,248,463,239,184,44,6,344,118,69,128,505,394,474,24,397,21,354,221,242,214,91,303,138,454,457,290,199,497,235,322,36,337,393,137,162,38,8,459,350,480,2,23,485,134,493,135,209,355,180,321,48,34,507,158,257,111,383,473,409,324,224,32,500,377,117,267,479,452,204,266,417,262,93,141,187,509,285,508,307,391,159,296,332,470,359,61,156,53,320,478,464,382,338,86,30,139,362,236,371,246,144,342,413,215,129,316,122,109,222,323,388,302,471,406,176,136,89,250,205,140,19,79,120,151,98,17,229,228,502,219,56,498,57,47,335,352,510,395,35,442,149,287,436,263,245,130,305,495,102,461,364,475,423,247,353,282,434,113,74,396,73,234,490,182,177,76,87,405,85,25,208,160,40,96,5,306,84,274,192,492,309,293,174,484,420,132,42,94,315,447,468,501,499,164,451,92,469,211,114,3,14,440,88,407,190,157,154,430,241,59,78,486,82,325,126,450,60,340,308,366,358,58,170,301,404,387,449,370,255,272,67,97,278,189,339,488,481,336,124,191,368,445,289,275,20,252,254,203,155,253,188,63,99,28,80,146,11,196,148,218,49,240,195,107,52,186,13,27,419,333,299,356,489,416,460,286,411,421,72,68,169,472,216,206,9,100,31,295,183,225,133,491,448,408,503,327,75,401,166,494,455,424,372,467,226,127,280,26,326,12,105,70,178,193,71,482,292,171,426,33,115,400,227,476,376,165,260,54,81,238,265,317,462,143,77,39,168,233,167,477,506,108,181,264,217,349,4,22,298,328,173,103,270,428,422,487,232,104,197,329,116,465,399,172,145,304,334,110,343,175,496,297,458,43,147,50,312,62,142,483,7,29,466,288,51,386,345,414,415,385,425,367,220,381,439,123,258,418,119,276,15,269,389,153,90,446,83,112,212,259,319,202,433,244,237,412,281,384,261,403,223,279,441,249,294,435,268,231,402,438,284,251,179,427,37,437,431];

function hash16bit(txt) {
    let h = txt.length % 511;
    for (let i = 0; i < txt.length; i++) {
        h = permutation_16bit[(h + txt.charCodeAt(i)) % 511];
    }
    console.log(JSON.stringify(permutation_16bit));
    return h;

}

function distributeItems1() {
    const bucketsContainer = document.getElementById('bucketsContainer1');
    const calculationDisplay = document.getElementById('calculationDisplay1');
    bucketsContainer.innerHTML = ''; // Clear previous buckets


    const buckets = {}; // Object to store buckets by index

    // Process each item with a delay
    items.forEach((item, index) => {
        setTimeout(() => {
            const endHashed = hash16bit(item);
            const bucketKey = Math.floor(endHashed / 16);
            const bucketValue = endHashed % 16;
            calculationDisplay.innerHTML = `Processing: ${item} <br>
                                            The hashed value is determined by the value from a randomized list based on the index.<br>                                            Hashed Value: ${endHashed} <br>
                                            Bucket Key (end_hashed // 16): ${bucketKey} <br>
                                            Bucket Value (end_hashed % 16): ${bucketValue}`;

            // Check if the bucket exists, if not create it
            if (!buckets[bucketKey]) {
                const bucket = document.createElement('div');
                bucket.classList.add('bucket');
                const bucketLabel = document.createElement('div');
                bucketLabel.textContent = `Bucket ${bucketKey}`;
                bucketLabel.style.fontWeight = 'bold';
                bucket.appendChild(bucketLabel);
                buckets[bucketKey] = bucket;

                // Insert the bucket in the correct order
                insertBucketInOrder(bucketsContainer, bucket, bucketKey);
            }

            // Create an element for the item and add it to the bucket
            const itemElem = document.createElement('span');
            itemElem.textContent = bucketValue;
            itemElem.classList.add('character');
            itemElem.style.opacity = '0';
            buckets[bucketKey].appendChild(itemElem);

            // Simple fade-in animation
            anime({
                targets: itemElem,
                opacity: [0, 1],
                easing: 'easeInOutQuad',
                duration: 1000
            });

        }, index * 1500);
    });
}

// Function to insert bucket in the correct order
function insertBucketInOrder(container, bucket, index) {
    const existingBuckets = Array.from(container.children);
    const insertBeforeBucket = existingBuckets.find(b => {
        const label = b.querySelector('div').textContent;
        const bucketIndex = parseInt(label.replace('Bucket ', ''));
        return bucketIndex > index;
    });
    if (insertBeforeBucket) {
        container.insertBefore(bucket, insertBeforeBucket);
    } else {
        container.appendChild(bucket);
    }
}

 function reduction() {
            function reductionFunction4(md5Hash) {
            characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            charLen = characters.length;
            let hashInt = parseInt(md5Hash.substring(0, 8), 16) + 1;
            let plaintext = '';
            for (let i = 0; i < 3; i++) { // Desired plaintext length
                plaintext += characters[hashInt % charLen];
                hashInt = Math.floor(hashInt / charLen);
            }
            return plaintext;
            }

        const exampleHash = '8ae4df6886632a5c1732d08cc9c4186d'; // Example MD5 hash (for 'test')
        const reducedHash = reductionFunction4(exampleHash);

        // Display the result in the HTML element with id "reduction"
        document.getElementById('reduction').innerHTML = `The reduction function is used on the hash. <br>
                                                          The reduct plaintext: ${reducedHash}`;


        }

 function reduction1() {
            function reductionFunction4(md5Hash) {
            characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            charLen = characters.length;
            let hashInt = parseInt(md5Hash.substring(0, 8), 16) + 1;
            let plaintext = '';
            for (let i = 0; i < 3; i++) { // Desired plaintext length
                plaintext += characters[hashInt % charLen];
                hashInt = Math.floor(hashInt / charLen);
            }
            return plaintext;
            }

        const exampleHash = '8ae4df6886632a5c1732d08cc9c4186d'; // Example MD5 hash (for 'test')
        const reducedHash = reductionFunction4(exampleHash);

        // Display the result in the HTML element with id "reduction"
        document.getElementById('reduction1').innerHTML = `The reduction function is used on the hash. <br>
                                                          The reduct plaintext: ${reducedHash}`;


        }

function bucket1(){
            const bucket1 = document.getElementById('bucket1');
            item = "RpV"
            let sumNumber = 0;
            for (let char of item) {
                sumNumber += char.charCodeAt(0); // Adds the ASCII value of each character
            }
            const remainder = sumNumber % (16);
            bucket1.innerHTML = `Processing: ${item} <br>
                                            Total ASCII Sum: ${sumNumber} <br>
                                            Next use the Total ASCII SUM mod by the number of bucket size to determine which bucket to input. <br>
                                            ${sumNumber} % 16 = ${remainder} <br>
                                            Bucket Index: ${remainder}`;}

function bucket2(){
            item = "RpV";
            const bucket2 = document.getElementById('bucket2');
            const endHashed = hash16bit(item);
            const bucketKey = Math.floor(endHashed / 16);
            const bucketValue = endHashed % 16;
            bucket2.innerHTML = `Processing: ${item} <br>
                                 The hashed value is determined by the value from a randomized list based on the index.<br>                                            Hashed Value: ${endHashed} <br>
                                 Bucket Key (end_hashed // 16): ${bucketKey} <br>
                                 Bucket Value (end_hashed % 16): ${bucketValue}`;}


function linearSearch() {
    // Set the value to search for
    const searchKey = 31;

    // Get all list items
    const listItems = document.querySelectorAll('#list-container .list-item');

    // Initialize the result message
    let resultMessage = 'Key not found';
    let found = false;

    // Reset previous animations and styles
    listItems.forEach(item => {
        item.style.backgroundColor = '';
        item.style.color = '';
    });

    // Linear search through the list items with Anime.js animation
    listItems.forEach((item, index) => {

        setTimeout(() => {

            if (found) return; // Stop further animations if the key is found
            anime({
                targets: item,
                backgroundColor: '#FFFF00', // Yellow color
                color: '#000', // Black text
                duration: 500,
                easing: 'easeInOutQuad',
                complete: function() {
                    if (parseInt(item.textContent, 10) === searchKey) {
                        found = true;
                        anime({
                            targets: item,
                            backgroundColor: '#008000', // Green color
                            color: '#FFF', // White text
                            duration: 500,
                            easing: 'easeInOutQuad'
                        });
                        resultMessage = 'Key found!';
                    } else if (!found) { // Only reset if the key hasn't been found
                        anime({
                            targets: item,
                            backgroundColor: '#FFF', // Reset color
                            color: '#000', // Reset text color
                            duration: 500,
                            easing: 'easeInOutQuad',
                            delay: 500
                        });
                    }

                    // Update the result message in the UI
                    document.getElementById('result').textContent = resultMessage;
                }
            });
        }, index * 1000); // Delay between each item animation
    });
}


function rebuild_chain() {
    const columns = [
        "Initial Plaintext", "First MD5 Hash", "First Reduction",
        "Second MD5 Hash", "Second Reduction", "Third MD5 Hash",
        "Third Reduction", "Fourth MD5 Hash", "Fourth Reduction"
    ];

    const div = document.getElementById("chain1");

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.border = "1";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        th.style.border = "1px solid black";
        th.style.padding = "8px";
        th.style.textAlign = "left";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    div.appendChild(table);

    // Sample data to add
    const rowData = [
        "12345", "...84e7b", "0Ej9O2", "...568c8", "FWfT", "...bf6bd", "ew3gc", "...4186d", "RpV"
    ];

    // Create a row and cells
    const row = document.createElement("tr");
    tbody.appendChild(row);

    rowData.forEach((data, index) => {
        const cell = document.createElement("td");
        cell.textContent = data;
        cell.style.border = "1px solid black";
        cell.style.padding = "2px";
        cell.style.opacity = "0"; // Set initial opacity to 0 for animation
        cell.style.transform = "translateY(-20px)"; // Initial position for animation
        row.appendChild(cell);
    });

    // Animate each cell in the row
    anime({
        targets: row.querySelectorAll('td'),
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 500,
        delay: anime.stagger(500), // Stagger the animation for each cell
        easing: 'easeOutQuad',
        complete: () => {
            // Highlight the third last cell after the animation
            const cells = row.querySelectorAll('td');
            const highlightCell = cells[cells.length - 3]; // Third last cell
            highlightCell.style.backgroundColor = '#ff0'; // Yellow background
            highlightCell.style.color = '#000'; // Black text for contrast

            // Optional: Add a pulse animation effect to the highlighted cell
            anime({
                targets: highlightCell,
                scale: [1, 1.2, 1],
                duration: 1000,
                easing: 'easeInOutQuad',
                loop: true
            });
        }
    });
}

function linearSearch1() {
    // Set the value to search for
    const searchKey = 'RpV';

    // Get all list items
    const listItems = document.querySelectorAll('#list-container1 .list-item');

    // Initialize the result message
    let resultMessage = 'Key not found';
    let found = false;

    // Reset previous animations and styles
    listItems.forEach(item => {
        item.style.backgroundColor = '';
        item.style.color = '';
    });

    // Linear search through the list items with Anime.js animation
    listItems.forEach((item, index) => {

        setTimeout(() => {

            if (found) return; // Stop further animations if the key is found
            anime({
                targets: item,
                backgroundColor: '#FFFF00', // Yellow color
                color: '#000', // Black text
                duration: 500,
                easing: 'easeInOutQuad',
                complete: function() {
                    if (item.textContent === searchKey) {
                        found = true;
                        anime({
                            targets: item,
                            backgroundColor: '#008000', // Green color
                            color: '#FFF', // White text
                            duration: 500,
                            easing: 'easeInOutQuad'
                        });
                        resultMessage = 'Key found!';
                    } else if (!found) { // Only reset if the key hasn't been found
                        anime({
                            targets: item,
                            backgroundColor: '#FFF', // Reset color
                            color: '#000', // Reset text color
                            duration: 500,
                            easing: 'easeInOutQuad',
                            delay: 500
                        });
                    }

                    // Update the result message in the UI
                    document.getElementById('result').textContent = resultMessage;
                }
            });
        }, index * 1000); // Delay between each item animation
    });
}


function rebuild_chain1() {
    const columns = [
        "Initial Plaintext", "First MD5 Hash", "First Reduction",
        "Second MD5 Hash", "Second Reduction", "Third MD5 Hash",
        "Third Reduction", "Fourth MD5 Hash", "Fourth Reduction"
    ];

    const div = document.getElementById("chain2");

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.border = "1";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        th.style.border = "1px solid black";
        th.style.padding = "8px";
        th.style.textAlign = "left";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    div.appendChild(table);

    // Sample data to add
    const rowData = [
        "12345", "...84e7b", "0Ej9O2", "...568c8", "FWfT", "...bf6bd", "ew3gc", "...4186d", "RpV"
    ];

    // Create a row and cells
    const row = document.createElement("tr");
    tbody.appendChild(row);

    rowData.forEach((data, index) => {
        const cell = document.createElement("td");
        cell.textContent = data;
        cell.style.border = "1px solid black";
        cell.style.padding = "2px";
        cell.style.opacity = "0"; // Set initial opacity to 0 for animation
        cell.style.transform = "translateY(-20px)"; // Initial position for animation
        row.appendChild(cell);
    });

    // Animate each cell in the row
    anime({
        targets: row.querySelectorAll('td'),
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 500,
        delay: anime.stagger(500), // Stagger the animation for each cell
        easing: 'easeOutQuad',
        complete: () => {
            // Highlight the third last cell after the animation
            const cells = row.querySelectorAll('td');
            const highlightCell = cells[cells.length - 3]; // Third last cell
            highlightCell.style.backgroundColor = '#ff0'; // Yellow background
            highlightCell.style.color = '#000'; // Black text for contrast

            // Optional: Add a pulse animation effect to the highlighted cell
            anime({
                targets: highlightCell,
                scale: [1, 1.2, 1],
                duration: 1000,
                easing: 'easeInOutQuad',
                loop: true
            });
        }
    });
}



