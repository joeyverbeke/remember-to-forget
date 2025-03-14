// Upload functionality
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewGrid = document.getElementById('preview-grid');
    const uploadText = uploadArea.querySelector('.upload-text');
    
    let pendingFiles = [];
    let hasUploaded = JSON.parse(localStorage.getItem('hasUploaded') || 'false');

    // Move upload icon to preview grid initially
    const uploadIcon = document.querySelector('.upload-icon');
    previewGrid.appendChild(uploadIcon);

    // Hide upload button if already uploaded
    if (hasUploaded) {
        uploadBtn.style.display = 'none';
    }

    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
        previewGrid.innerHTML = '';
        previewGrid.appendChild(uploadIcon);
        pendingFiles = [];
    });

    uploadIcon.addEventListener('click', (e) => {
        e.stopPropagation();  // Prevent event from bubbling
        fileInput.click();
    });

    // Drag and drop handling
    uploadArea.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'white';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '';
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!pendingFiles.some(f => f.name === file.name)) {
                pendingFiles.push(file);
                addPreview(file);
            }
        });
    }

    function addPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            
            div.appendChild(img);
            previewGrid.appendChild(div);
        };
        reader.readAsDataURL(file);
    }

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'remember.';
    saveBtn.className = 'save-btn';
    uploadArea.appendChild(saveBtn);

    saveBtn.addEventListener('click', () => {
        if (pendingFiles.length > 0) {
            const formData = new FormData();
            pendingFiles.forEach(file => {
                formData.append('images', file);
            });

            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(uploadedFiles => {
                hasUploaded = true;
                localStorage.setItem('hasUploaded', 'true');
                uploadBtn.style.display = 'none';
                uploadModal.style.display = 'none';

                uploadedFiles.forEach(file => {
                    // Add new image to grid
                    const div = document.createElement('div');
                    div.className = 'photo-item';
                    
                    const img = document.createElement('img');
                    img.src = file.url;
                    img.dataset.id = file.id;
                    img.dataset.originalSrc = file.url;
                    
                    div.appendChild(img);
                    document.getElementById('photo-grid').appendChild(div);
                });

                // Clear previews and pending files
                previewGrid.innerHTML = '';
                pendingFiles = [];
            })
            .catch(error => {
                console.error('Upload failed:', error);
            });
        }
    });
}); 