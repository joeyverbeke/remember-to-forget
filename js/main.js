document.addEventListener('DOMContentLoaded', () => {
    // for those who don't want to forget
    const SHOW_RESET = false;

    // breathe between light and shadow
    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function animateBackground() {
        const duration = 120000;
        let startTime = null;
        let goingToWhite = true;

        function updateBackground(currentTime) {
            if (!startTime) startTime = currentTime;
            
            let elapsed = (currentTime - startTime) % (duration * 2);
            let progress = (elapsed % duration) / duration;

            if (elapsed > duration) {
                goingToWhite = false;
                progress = 1 - progress;
            } else {
                goingToWhite = true;
            }

            const easedProgress = easeInOutCubic(progress);
            
            const colorValue = Math.round(easedProgress * 255);
            
            document.body.style.backgroundColor = rgbToHex(colorValue, colorValue, colorValue);

            if (elapsed >= duration * 2) {
                startTime = currentTime;
            }

            requestAnimationFrame(updateBackground);
        }

        requestAnimationFrame(updateBackground);
    }

    // what do we choose to attend to?
    animateBackground();

    const photoGrid = document.getElementById('photo-grid');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const viewCount = document.getElementById('view-count');
    const closeBtn = document.querySelector('.close');
    const resetBtn = document.getElementById('reset-btn');
    
    resetBtn.style.display = SHOW_RESET ? 'inline-block' : 'none';

    // count the rememberings
    let viewCounts = JSON.parse(localStorage.getItem('viewCounts') || '{}');
    
    getAllImages().then(images => {
        images.forEach(image => {
            const div = document.createElement('div');
            div.className = 'photo-item';
            
            const img = document.createElement('img');
            img.src = image.data;
            img.dataset.id = image.id;
            img.dataset.originalSrc = image.originalData;
            
            div.appendChild(img);
            photoGrid.appendChild(div);
        });
    });
    
    photoGrid.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (!img) return;
        
        const id = img.dataset.id;
        modal.dataset.currentImageId = id;
        
        modalImg.src = img.src;
        viewCount.textContent = (viewCounts[id] || 0);
        modal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', () => {
        const id = modal.dataset.currentImageId;
        if (id) {
            const currentImg = document.querySelector(`img[data-id="${id}"]`);
            viewCounts[id] = (viewCounts[id] || 0) + 1;
            localStorage.setItem('viewCounts', JSON.stringify(viewCounts));
            degradeImage(currentImg, viewCounts[id]);
        }
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            const id = modal.dataset.currentImageId;
            if (id) {
                const currentImg = document.querySelector(`img[data-id="${id}"]`);
                viewCounts[id] = (viewCounts[id] || 0) + 1;
                localStorage.setItem('viewCounts', JSON.stringify(viewCounts));
                degradeImage(currentImg, viewCounts[id]);
            }
            modal.style.display = 'none';
        }
    });
    
    function degradeImage(img, views) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        // let memory fade
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // each remembering leaves traces of forgetting
        // like static in an old dream
        // slowly dissolving into noise
        const intensity = Math.min(views * 25, 100);
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() * 100 < intensity * 2.5) {
                data[i] = Math.min(255, Math.max(0, data[i] + (Math.random() * 100 - 50)));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (Math.random() * 100 - 50)));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (Math.random() * 100 - 50)));
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const newImageUrl = canvas.toDataURL('image/jpeg');
        img.src = newImageUrl;
        modalImg.src = newImageUrl;
        
        updateImage(img.dataset.id, {
            id: img.dataset.id,
            data: newImageUrl,
            originalData: img.dataset.originalSrc
        });
    }

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all images to their original state?')) {
            clearImages();
            
            hasUploaded = false;
            localStorage.setItem('hasUploaded', 'false');
            
            document.querySelectorAll('.photo-item img').forEach(img => {
                img.src = img.dataset.originalSrc;
            });
            
            viewCounts = {};
            imageStates = {};
        }
    });
}); 