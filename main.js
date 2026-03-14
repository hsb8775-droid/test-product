/**
 * Lumina Notes - Core Logic
 * Implements State Management, LocalStorage persistence, and Web Components.
 */

// --- State Management ---
class Store extends EventTarget {
  constructor() {
    super();
    this.notes = JSON.parse(localStorage.getItem('lumina-notes')) || [
      { id: '1', title: 'Welcome to Lumina', content: 'Start typing your first note here...', updated: Date.now() }
    ];
    this.activeNoteId = this.notes[0]?.id || null;
    this.searchQuery = '';
  }

  save() {
    localStorage.setItem('lumina-notes', JSON.stringify(this.notes));
    this.dispatchEvent(new CustomEvent('change'));
  }

  get filteredNotes() {
    const query = this.searchQuery.toLowerCase();
    return this.notes
      .filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
      .sort((a, b) => b.updated - a.updated);
  }

  getActiveNote() {
    return this.notes.find(n => n.id === this.activeNoteId);
  }

  addNote() {
    const newNote = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      updated: Date.now()
    };
    this.notes.unshift(newNote);
    this.activeNoteId = newNote.id;
    this.save();
  }

  updateNote(id, data) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      Object.assign(note, data, { updated: Date.now() });
      this.save();
    }
  }

  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    if (this.activeNoteId === id) {
      this.activeNoteId = this.notes[0]?.id || null;
    }
    this.save();
  }

  setActiveNote(id) {
    this.activeNoteId = id;
    this.dispatchEvent(new CustomEvent('change'));
  }

  setSearch(query) {
    this.searchQuery = query;
    this.dispatchEvent(new CustomEvent('change'));
  }
}

const store = new Store();

// --- Web Components ---

class NoteEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    store.addEventListener('change', () => this.update());
  }

  update() {
    const note = store.getActiveNote();
    if (!note) {
      this.shadowRoot.innerHTML = `<div class="empty-state">Select or create a note</div>`;
      return;
    }

    const titleInput = this.shadowRoot.querySelector('#editor-title');
    const contentInput = this.shadowRoot.querySelector('#editor-content');

    if (this.currentNoteId !== note.id) {
      this.currentNoteId = note.id;
      titleInput.value = note.title;
      contentInput.value = note.content;
    }
  }

  render() {
    const note = store.getActiveNote();
    this.currentNoteId = note?.id;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: flex; flex-direction: column; height: 100%; padding: 2rem; box-sizing: border-box; }
        input, textarea { 
          border: none; outline: none; width: 100%; font-family: inherit; background: transparent; 
          color: oklch(20% 0.02 200);
        }
        #editor-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.02em; }
        #editor-content { font-size: 1.1rem; line-height: 1.7; flex-grow: 1; resize: none; }
        .empty-state { 
          height: 100%; display: flex; align-items: center; justify-content: center; 
          color: oklch(50% 0.02 200); font-style: italic; 
        }
        ::placeholder { color: oklch(80% 0.02 200); }
      </style>
      ${note ? `
        <input type="text" id="editor-title" placeholder="Note Title" value="${note.title}">
        <textarea id="editor-content" placeholder="Start writing..." spellcheck="false">${note.content}</textarea>
      ` : `<div class="empty-state">Select or create a note</div>`}
    `;

    if (note) {
      this.shadowRoot.querySelector('#editor-title').addEventListener('input', (e) => {
        store.updateNote(note.id, { title: e.target.value });
      });
      this.shadowRoot.querySelector('#editor-content').addEventListener('input', (e) => {
        store.updateNote(note.id, { content: e.target.value });
      });
    }
  }
}

customElements.define('note-editor', NoteEditor);

// --- DOM Integration ---

const noteList = document.getElementById('note-list');
const newNoteBtn = document.getElementById('new-note-btn');
const searchInput = document.getElementById('search-input');

function renderNoteList() {
  const notes = store.filteredNotes;
  noteList.innerHTML = notes.map(note => `
    <div class="note-item ${note.id === store.activeNoteId ? 'active' : ''}" data-id="${note.id}">
      <div class="note-title-preview">${note.title || 'Untitled Note'}</div>
      <div class="note-content-preview">${note.content || 'No content yet...'}</div>
    </div>
  `).join('');

  // Add click listeners
  noteList.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', () => {
      store.setActiveNote(item.dataset.id);
    });
  });
}

newNoteBtn.addEventListener('click', () => {
  store.addNote();
});

searchInput.addEventListener('input', (e) => {
  store.setSearch(e.target.value);
});

store.addEventListener('change', renderNoteList);

// Initial render
renderNoteList();
