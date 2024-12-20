const chatIds = [
    { id: '1270488169', name: 'Tannc1'},
    { id: '1442486099', name: 'Giang Huế'}
];

const userSelect = document.getElementById('userSelect');
// Tạo danh sách chọn từ chatIds
chatIds.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    userSelect.appendChild(option);
});

const dropZone = document.getElementById('dropZone');
const messageInput = document.getElementById('message');

document.getElementById('sendButton').addEventListener('click', function() {
    const message = document.getElementById('message').value;
    const fileInput = document.getElementById('fileInput');
    const botToken = '7824504306:AAFzUmlNZoA6JD310pUnIhbDQqCHaU-RnBk'; // Thay YOUR_BOT_TOKEN bằng token của bot
    const chatId = userSelect.value; // Thay USER_CHAT_ID bằng chat ID của người dùng

    if (message || dropZone) {
        // Gửi tin nhắn văn bản
        if (message) {
            const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thành công!',
                            text: 'Tin nhắn đã được gửi!',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Có lỗi xảy ra!',
                            text: 'Vui lòng thử lại sau.',
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi kết nối!',
                        text: 'Vui lòng kiểm tra kết nối của bạn.',
                    });
                    console.error('Error:', error);
                });
        }

        // Tự xóa ô nhập liệu
        document.getElementById('message').value = '';
        fileInput.value = '';
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: 'Vui lòng nhập tin nhắn, chọn tệp hoặc dán hình ảnh!',
        });
    }
});

// Xử lý sự kiện nhấp chuột vào dropZone để mở file input
dropZone.addEventListener('click', function () {
    fileInput.click(); // Kích hoạt input file khi nhấp vào dropZone
});

// Xử lý sự kiện khi chọn file qua file input
fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    handleFile(file); // Gọi hàm xử lý file
});

// Xử lý sự kiện drag-and-drop
dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
    dropZone.classList.add('hover');
    dropZone.textContent = "Thả tệp vào đây...";
});

dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('hover');
    dropZone.textContent = "Kéo thả hoặc nhấp để chọn tệp/hình ảnh";
});

dropZone.addEventListener('drop', function (event) {
    event.preventDefault();
    dropZone.classList.remove('hover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        handleFile(file); // Gọi hàm xử lý file
    }
});

// Hàm xử lý file
function handleFile(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            dropZone.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px;" />`;
        };
        reader.readAsDataURL(file);
    } else {
        dropZone.innerHTML = `<p style="text-align: center; color: #555;">Tệp: ${file.name}</p>`;
    }
}

// Hàm hiển thị preview trong DropZone
function showPreview(imageSrc) {
    messageInput.innerHTML = `<img src="${imageSrc}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px;" />`;
}

// Xử lý sự kiện paste vào ô nhập tin nhắn
messageInput.addEventListener('paste', (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;

    // Kiểm tra nếu có file hình ảnh được paste
    if (clipboardData.files.length > 0) {
        const file = clipboardData.files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Hiển thị preview ảnh trong DropZone
                showPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Gửi ảnh qua API
            handleFile(file);
        }
    } else {
        // Kiểm tra nếu nội dung được paste là URL hình ảnh
        const pastedText = clipboardData.getData('text');
        if (pastedText.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
            // Hiển thị preview ảnh từ URL
            showPreview(pastedText);

            // Tải ảnh từ URL và gửi qua API
            fetch(pastedText)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'image.jpg', { type: blob.type });
                    handleFile(file);
                })
                .catch(error => console.error('Lỗi khi tải ảnh từ URL:', error));
        }
    }
});
