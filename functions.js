let db;
const request = indexedDB.open('libraryDB', 1);

request.onerror = function(event) {
    console.error("Error en base de datos: ", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadBooksTable(); 
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('books', { keyPath: 'id' });
};

function loadBooksTable() {
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');

    const request = store.getAll();

    request.onsuccess = function(event) {
        const books = event.target.result;
        const tableBody = document.querySelector('#booksTable tbody');
        tableBody.innerHTML = ''; 

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td>$${book.price}</td>
                <td><button class="delete-btn" data-id="${book.id}">Eliminar</button></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteBook);
        });
    };
}

function addBook() {
    const name = document.getElementById('name').value.trim();
    const author = document.getElementById('author').value.trim();
    const price = parseFloat(document.getElementById('price').value);

    if (!name || !author || isNaN(price) || price <= 0) {
        alert("Por favor ingresa un título, autor y precio válido.");
        return;
    }

    const transaction = db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function(event) {
        const books = event.target.result;
        const newBook = {
            id: books.length > 0 ? books[books.length - 1].id + 1 : 1, 
            name: name,
            author: author,
            price: price
        };

        store.add(newBook);
        
        document.getElementById('name').value = '';
        document.getElementById('author').value = '';
        document.getElementById('price').value = '';

        loadBooksTable();
    };
}

function deleteBook(event) {
    const bookId = parseInt(event.target.getAttribute('data-id')); 
    const transaction = db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    store.delete(bookId);
    loadBooksTable();
}

document.getElementById('addBook').addEventListener('click', addBook);