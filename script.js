const createBtn = document.querySelector('#confirm__creating');
const title = document.querySelector('#title');
const author = document.querySelector('#author');
const pages = document.querySelector('#pages');
const read = document.querySelector('#read');
const books = document.querySelector('.books')
const form = document.querySelector('.form')

let myLibrary = [];


form.addEventListener('submit', createBook)

class Book {

  constructor(title, author, pages, read) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
  }

  get read() {
    return this._read;
  }

  set read(value) {
    if (value) {
      this._read = 'Read';
    } else if (!value) {
      this._read = 'Not read';
    }
  }
}

function addBooksToLibrary(title, author, pages, read) {
  myLibrary.push(new Book(title, author, pages, read));
}

function build() {
  books.innerHTML = '';
  for (var i = 0; i < myLibrary.length; i++) {
    const book = document.createElement('div');
    book.className = 'book';
    book.id = `arrayPos-${i}`;

    const deleteBook = document.createElement('button');
    deleteBook.className = 'book-delete';
    deleteBook.setAttribute("onclick", `del(${i})`);
    deleteBook.innerHTML = '<img src="images/x.svg" alt="x">';
    book.appendChild(deleteBook);

    const bookTitle = document.createElement('h4');
    bookTitle.className = 'book-title';
    bookTitle.innerText = myLibrary[i].title;
    book.appendChild(bookTitle);

    const bookAuthor = document.createElement('p');
    bookAuthor.className = 'book-author';
    bookAuthor.innerText = myLibrary[i].author;
    book.appendChild(bookAuthor);

    const bookPages = document.createElement('p');
    bookPages.className = 'book-pages';
    bookPages.innerText = myLibrary[i].pages;
    book.appendChild(bookPages);

    const editBook = document.createElement('button');
    editBook.className = 'book-readed';
    editBook.setAttribute("onclick", `edit(${i})`);
    editBook.innerText = myLibrary[i].read;
    book.appendChild(editBook);

    books.appendChild(book)
  }
}

function del(id) {
  myLibrary.splice(id, 1);
  document.querySelector(`#arrayPos-${id}`).remove();
  setTimeout(build, 100);
}

function createBook(e) {
  if (title.vaule != '' && author.value != '' && pages.value != '0') {
    addBooksToLibrary(title.value, author.value, pages.value, read.checked);
    build();
  }
  e.preventDefault()
}

function edit(id) {
  if (myLibrary[id]._read === 'Read') {
    myLibrary[id]._read = 'Not read'
  } else {
    myLibrary[id]._read = 'Read';
  }
  build();
}
