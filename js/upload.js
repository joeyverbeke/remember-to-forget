document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewGrid = document.getElementById('preview-grid');
    const uploadText = uploadArea.querySelector('.upload-text');
    
    let pendingFiles = [];
    let hasUploaded = JSON.parse(localStorage.getItem('hasUploaded') || 'false');

    const uploadIcon = document.querySelector('.upload-icon');
    previewGrid.appendChild(uploadIcon);

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
        e.stopPropagation();
        fileInput.click();
    });

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

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'remember.';
    saveBtn.className = 'save-btn';
    uploadArea.appendChild(saveBtn);

    saveBtn.addEventListener('click', () => {
        if (pendingFiles.length > 0) {
            Promise.all(pendingFiles.map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    const imageData = {
                        id,
                        data: e.target.result,
                        originalData: e.target.result
                    };
                    await saveImage(imageData);
                    resolve(imageData);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            })))
            .then(savedImages => {
                hasUploaded = true;
                localStorage.setItem('hasUploaded', 'true');
                uploadBtn.style.display = 'none';
                uploadModal.style.display = 'none';

                savedImages.forEach(imageData => {
                    const div = document.createElement('div');
                    div.className = 'photo-item';
                    
                    const img = document.createElement('img');
                    img.src = imageData.data;
                    img.dataset.id = imageData.id;
                    img.dataset.originalSrc = imageData.originalData;
                    
                    div.appendChild(img);
                    document.getElementById('photo-grid').appendChild(div);
                });

                previewGrid.innerHTML = '';
                pendingFiles = [];
            })
            .catch(error => {
                console.error('Upload failed:', error);
            });
        }
    });
}); 