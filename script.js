// Script.js

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchForm = document.getElementById('searchBook');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBookElement(bookItem);
    if (!bookItem.isComplete)
      incompleteBookshelfList.append(bookElement);
    else
      completeBookshelfList.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

// menggunakan local storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = parseInt(document.getElementById('inputBookYear').value);  // Mengubah string menjadi number
  const bookIsComplete = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBookElement(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('action');

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textTitle, textAuthor, textYear, textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('green');
    undoButton.innerText = 'Belum selesai dibaca';
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = 'Hapus buku';
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    textContainer.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('green');
    checkButton.innerText = 'Selesai dibaca';
    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = 'Hapus buku';
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    textContainer.append(checkButton, trashButton);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  const confirmDialog = confirm("Apakah Anda yakin ingin menghapus buku ini?");
  if (confirmDialog) {
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function searchBook() {
  const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const bookItem of books) {
    if (bookItem.title.toLowerCase().includes(searchTitle)) {
      const bookElement = makeBookElement(bookItem);
      if (!bookItem.isComplete)
        incompleteBookshelfList.append(bookElement);
      else
        completeBookshelfList.append(bookElement);
    }
  }
}
