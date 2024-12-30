  document.addEventListener("DOMContentLoaded", function() {
      function resetBoxes(containerId) {
        const boxesToAnimate = document.querySelectorAll(`#${containerId} .box`);
        boxesToAnimate.forEach(box => {
            box.style.transform = ''; // Reset any transformations
            box.style.opacity = '1'; // Reset opacity
            box.style.zIndex = ''; // Reset zIndex

        });
    }
            function animateBoxes(containerId, targetBoxId) {
                const boxesToAnimate = document.querySelectorAll(`#${containerId} .box`);
                const targetBox = document.getElementById(targetBoxId);
                const targetBoxRect = targetBox.getBoundingClientRect();
                const boxesWrapperRect = document.querySelector(`#${containerId}`).getBoundingClientRect();

                let timeline = anime.timeline({
                    easing: 'easeInOutQuad',
                    duration: 200
                });

                boxesToAnimate.forEach((box, index) => {
                    const boxRect = box.getBoundingClientRect();
                    const translateX = targetBoxRect.left + (targetBoxRect.width / 2) - (boxRect.left + (boxRect.width / 2));
                    const translateY = targetBoxRect.top + (targetBoxRect.height / 2) - (boxRect.top + (boxRect.height / 2));

                    timeline.add({
                        targets: box,
                        translateX: translateX,
                        translateY: translateY,
                        opacity: [1, 0], // Fade out
                        delay: index * 0, // Delay each box by 500ms
                        duration: 200, // Duration of the animation
                        begin: function(anim) {
                            box.style.zIndex = 10; // Ensure box is in front
                        }
                    });
                });
            }

            // Event listeners for the buttons
            document.getElementById('state-preparation-btn').addEventListener('click', function() {
                    resetBoxes('state-preparation-boxes'); // Reset the state of the boxes
                document.getElementById('state-preparation').classList.remove('hidden');
                animateBoxes('state-preparation-boxes', 'state-preparation');
            });

            document.getElementById('oracle-btn').addEventListener('click', function() {
                    resetBoxes('oracle-boxes'); // Reset the state of the boxes

                document.getElementById('oracle').classList.remove('hidden');
                animateBoxes('oracle-boxes', 'oracle');
            });

            const ctx = document.getElementById('myChart').getContext('2d');
            const values = new Array(16).fill(100 / 16);
            const labels = ['piL', 'RpV', '4dy', 'zTU', 'J8r', 'sm3', '9U3', '8xG', 'OPb', 'Aoj', 'Twe', 'WnM', 'dzV', 'VQD', 'eXo', '8JX'];
            const backgroundColors = new Array(16).fill('rgba(54, 162, 235, 0.2)');
            const borderColors = new Array(16).fill('rgba(54, 162, 235, 1)');

            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Probability (%)',
                        data: values,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: -60,
                            max: 60
                        }
                    }
                }
            });

            function updateHistogram() {
                // Initial equal probabilities
                let newValues = new Array(16).fill(100 / 16);
                const dominantIndex = labels.indexOf('VQD');
                let step = 0;


                function animateStep() {
                    if (step === 1) {
                        newValues = new Array(16).fill((100) / 16);
                        newValues[dominantIndex] = -(100/16);
                        backgroundColors[13] = 'rgba(255, 99, 132, 0.2)';
                        borderColors[13] = 'rgba(255, 99, 132, 1)';
                    } else if (step === 2) {
                        newValues = new Array(16).fill(87.48/15);
                        newValues[dominantIndex] = (12.52);
                        backgroundColors[13] = 'rgba(54, 162, 235, 0.2)';
                        borderColors[13] = 'rgba(54, 162, 235, 1)';
                    } else if (step === 3) {
                        newValues = new Array(16).fill(87.48/15);
                        newValues[dominantIndex] = -(12.52);
                        backgroundColors[13] = 'rgba(255, 99, 132, 0.2)';
                        borderColors[13] = 'rgba(255, 99, 132, 1)';
                    } else if (step === 4) {
                        newValues = new Array(16).fill(75.03/15);
                        newValues[dominantIndex] = (24.97);
                        backgroundColors[13] = 'rgba(54, 162, 235, 0.2)';
                        borderColors[13] = 'rgba(54, 162, 235, 1)';
                    } else if (step === 5) {
                        newValues = new Array(16).fill(75.03/15);
                        newValues[dominantIndex] = -(24.97);
                        backgroundColors[13] = 'rgba(255, 99, 132, 0.2)';
                        borderColors[13] = 'rgba(255, 99, 132, 1)';
                    } else if (step === 6) {
                        newValues = new Array(16).fill(49.95/15);
                        newValues[dominantIndex] = (50.05);
                        backgroundColors[13] = 'rgba(54, 162, 235, 0.2)';
                        borderColors[13] = 'rgba(54, 162, 235, 1)';
                    }

                    myChart.data.datasets[0].data = newValues;
                    myChart.update();

                    step++;
                    if (step < 7) {
                        setTimeout(animateStep, 2000);
                    }
                }

                animateStep();
            }

    document.getElementById('start-animation-btn').addEventListener('click', function() {
        myChart.data.datasets[0].data = new Array(16).fill(100 / 16); // Reset initial data
        myChart.update();
        updateHistogram();
    });
        });