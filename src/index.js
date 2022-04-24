import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config';

const signInBtn = document.querySelector('.sign-in');
const signOutBtn = document.querySelector('.sign-out');
const userNameElement = document.querySelector('.user-name');
const userPicElement = document.querySelector('.user-pic');

const title = document.querySelector('#title');
const author = document.querySelector('#author');
const pages = document.querySelector('#pages');
const read = document.querySelector('#read');
const books = document.querySelector('.books')
const form = document.querySelector('.form')

const firebaseAppConfig = getFirebaseConfig();
initializeApp(firebaseAppConfig);

let library = [];

class Book {
  constructor(title, author, pages, read) {
    this.name = title;
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

function addBookToLibrary(book) {
  if (!library.find(b => b.id === book.id)) library.push(book)
}

// Signs-in to Firebase
async function signIn() {
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
  loadBooks()
}

// Sign out of Firebase.
function signOutUser() {
  signOut(getAuth());
  library = [];
  books.innerHTML = '';
}

// Initiate firebase auth

function initFirebaseAuth() {
  onAuthStateChanged(getAuth(), authStateObserver)
}

function getProfilePicUrl() {
  return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
}

function getUserName() {
  return getAuth().currentUser.displayName;
}

// Saves a new Book to Cloud Firestore.
async function saveBook(title, author, pages, read) {
  // Add a new book entry to the Firebase database.
  try {
    if (getAuth().currentUser) {
      await addDoc(collection(getFirestore(), getAuth().currentUser.uid), {
        timestamp: serverTimestamp(),
        ...{ ...new Book(title, author, pages, read) }
      });
    } else {
      alert('You need to sign in first')
    }
  }
  catch (error) {
    console.error('Error adding new book to Firebase Database', error);
  }
}

// Loads chat books history and listens for upcoming ones.
async function loadBooks() {
  let uid;
  while (!uid) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (getAuth().currentUser) uid = getAuth().currentUser.uid
  }


  // Create the query to load the last 12 books and listen for new ones.
  const recentBooksQuery = query(collection(getFirestore(), uid), orderBy('timestamp'), limit(12));

  // Start listening to the query.
  library = [];
  onSnapshot(recentBooksQuery, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'removed') {
        deleteBook(change.doc.id);
      } else {
        const book = change.doc.data();
        addBookToLibrary({ id: change.doc.id, ...book })
      }
    });
    displayBooks()
  });
}

function deleteBook(id) {
  const div = document.getElementById(id);
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function authStateObserver(user) {
  if (user) {
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();


    userPicElement.style.backgroundImage =
      'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    userPicElement.removeAttribute('hidden');
    userNameElement.removeAttribute('hidden');
    signOutBtn.removeAttribute('hidden');

    // Hide sign-in button.
    signInBtn.setAttribute('hidden', 'true');
  } else {
    // User is signed out!
    // Hide user's profile and sign-out button.
    userPicElement.setAttribute('hidden', 'true');
    userNameElement.setAttribute('hidden', 'true');
    signOutBtn.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInBtn.removeAttribute('hidden');
  }
}

function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

signInBtn.addEventListener('click', signIn)
signOutBtn.addEventListener('click', signOutUser)
form.addEventListener('submit', createBook)


const BOOK_TEMPLATE =
  `<div class="book">
        <button class="book-delete">
        <img src="images/x.svg" alt="x"></button>
        <h4 class="book-title"></h4>
        <p class="book-author"></p>
        <p class="book-pages"></p>
        <button class="book-readed"></button>
   </div>`;

function createAndInsertBook(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = BOOK_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);
  div.className = 'book'

  // If timestamp is null, assume we've gotten a brand new book.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new book
  const existingBooks = books.children;
  if (existingBooks.length === 0) {
    books.appendChild(div);
  } else {
    let bookListNode = existingBooks[0];
    while (bookListNode) {
      const bookListNodeTime = bookListNode.getAttribute('timestamp');

      if (!bookListNodeTime) {
        throw new Error(
          `Child ${bookListNode.id} has no 'timestamp' attribute`
        );
      }

      if (bookListNodeTime > timestamp) {
        break;
      }

      bookListNode = bookListNode.nextSibling;
    }

    books.insertBefore(div, bookListNode);
  }

  return div;
}

function displayBooks() {
  books.innerHTML = ''
  library.forEach(book => {
    const bookElem = document.getElementById(book.id) || createAndInsertBook(book.id, book.timestamp);

    const deleteBook = bookElem.querySelector('.book-delete');
    deleteBook.addEventListener("click", () => del(book.id));

    const bookTitle = bookElem.querySelector('h4');
    bookTitle.innerText = book.name;

    const bookAuthor = bookElem.querySelector('.book-author');
    bookAuthor.innerText = book.author;

    const bookPages = bookElem.querySelector('.book-pages');
    bookPages.innerText = book.pages;

    const editBook = bookElem.querySelector('.book-readed');
    editBook.addEventListener("click", () => edit(book.id, book._read));
    editBook.innerText = book._read;

    books.appendChild(bookElem)
  })
}



async function del(id) {
  library = library.filter(book => book.id !== id)
  await deleteDoc(doc(getFirestore(), getAuth().currentUser.uid, id));
}

function createBook(e) {
  e.preventDefault()
  if (title.vaule != '' && author.value != '' && pages.value != '0') {
    saveBook(title.value, author.value, pages.value, read.checked);
  }
}

async function edit(id, read) {
  library.find(book => book.id === id)._read = checkRead(read)
  await updateDoc(doc(getFirestore(), getAuth().currentUser.uid, id), {
    _read: checkRead(read)
  });
}

function checkRead(read) {
  console.log(read)
  if (read === 'Read') {
    return 'Not read'
  }
  if (read === 'Not read') {
    return 'Read'
  }
}

initFirebaseAuth();
loadBooks();