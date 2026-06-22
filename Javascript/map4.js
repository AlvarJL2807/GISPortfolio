document.addEventListener("DOMContentLoaded", function() {
    // Get the modal elements
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("img01");
    const span = document.getElementsByClassName("close")[0];

    // Get all the images on the page
    const images = document.querySelectorAll('.full-width-map-img');
    
    // Add click event to each image
    images.forEach(img => {
        img.style.cursor = 'pointer'; // Changes the cursor to a pointer (hand)
        
        // Add the slight zoom hover effect to match your gallery items
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s';
        });
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        // Open modal on click
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src; // Sets the modal image to the one you clicked
        });
    });

    // Close the modal when clicking the X
    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Close the modal when clicking anywhere on the dark background
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
});