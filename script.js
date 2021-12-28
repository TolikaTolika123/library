const createBtn = document.querySelector('#confirm__creating');
const title = document.querySelector('#title');
const author = document.querySelector('#author');
const pages = document.querySelector('#pages');
const read = document.querySelector('#read');
const books = document.querySelector('.books')
let myLibrary = [];

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
  var output = "";
  for (var i = 0; i < myLibrary.length; i++) {
    output += `<div class="book" id="arrayPos-${i}">
                <button class="book-delete" onClick="del(${i})"><img src="images/x.svg" alt=""></button>
                <h4 class="book-title">${myLibrary[i].title}</h4>
                <p class="book-author">${myLibrary[i].author}</p>
                <p class="book-pages">${myLibrary[i].pages} pages</p>
                <button class="book-readed" onClick="edit(${i})">${myLibrary[i].read}</button>
              </div>`;
  }
  books.innerHTML = output;
}

function del(id) {
  myLibrary.splice(id, 1);
  document.getElementById('arrayPos-' + id).className = 'del';
  setTimeout(build, 100);
}

createBtn.addEventListener('click', () => {
  if (title.vaule != '' && author.value != '' && pages.value != '0') {
    addBooksToLibrary(title.value, author.value, pages.value, read.checked);
    build();
  }
})

function edit(id) {
  if (myLibrary[id]._read == 'Read') {
    myLibrary[id]._read = 'Not read'
  } else {
    myLibrary[id]._read = 'Read';
  }
  build();
}
