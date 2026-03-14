/**
 * Lumina Notes - Core Logic
 * Implements State Management, LocalStorage persistence, and Web Components.
 */

// --- State Management ---
class Store extends EventTarget {
  constructor() {
    super();
    this.notes = this._loadNotes();
    this.activeNoteId = this.notes[0]?.id || null;
    this.searchQuery = '';
    this.isDarkMode = localStorage.getItem('lumina-theme') === 'dark';
  }

  _loadNotes() {
    try {
      const saved = localStorage.getItem('lumina-notes');
      return saved ? JSON.parse(saved) : this._getDefaultNotes();
    } catch (e) {
      console.error('Failed to parse notes from localStorage:', e);
      return this._getDefaultNotes();
    }
  }

  _getDefaultNotes() {
    return [
      { id: '1', title: 'Welcome to Lumina', content: 'Start typing your first note here...', updated: Date.now() }
    ];
  }

  save() {
    try {
      localStorage.setItem('lumina-notes', JSON.stringify(this.notes));
      localStorage.setItem('lumina-theme', this.isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.dispatchEvent(new CustomEvent('change'));
  }

  applyTheme() {
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = this.isDarkMode ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.save();
  }

  get filteredNotes() {
    const query = this.searchQuery.toLowerCase();
    return this.notes
      .filter(n => (n.title || '').toLowerCase().includes(query) || (n.content || '').toLowerCase().includes(query))
      .sort((a, b) => b.updated - a.updated);
  }

  getActiveNote() {
    return this.notes.find(n => n.id === this.activeNoteId);
  }

  addNote() {
    const newNote = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
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

    if (titleInput && contentInput && this.currentNoteId !== note.id) {
      this.currentNoteId = note.id;
      titleInput.value = note.title || '';
      contentInput.value = note.content || '';
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
          color: #212529;
          color: oklch(20% 0.02 200);
        }
        :host-context(.dark) input, :host-context(.dark) textarea {
          color: #f8f9fa;
          color: oklch(95% 0.01 200);
        }
        #editor-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.02em; }
        #editor-content { font-size: 1.1rem; line-height: 1.7; flex-grow: 1; resize: none; }
        .empty-state { 
          height: 100%; display: flex; align-items: center; justify-content: center; 
          color: #868e96;
          color: oklch(50% 0.02 200); font-style: italic; 
        }
        ::placeholder { color: #dee2e6; color: oklch(80% 0.02 200); }
      </style>
      ${note ? `
        <input type="text" id="editor-title" placeholder="Note Title" value="${this._escapeHtml(note.title)}">
        <textarea id="editor-content" placeholder="Start writing..." spellcheck="false">${this._escapeHtml(note.content)}</textarea>
      ` : `<div class="empty-state">Select or create a note</div>`}
    `;

    if (note) {
      const titleInput = this.shadowRoot.querySelector('#editor-title');
      const contentInput = this.shadowRoot.querySelector('#editor-content');
      
      if (titleInput) {
        titleInput.addEventListener('input', (e) => {
          store.updateNote(note.id, { title: e.target.value });
        });
      }
      if (contentInput) {
        contentInput.addEventListener('input', (e) => {
          store.updateNote(note.id, { content: e.target.value });
        });
      }
    }
  }

  _escapeHtml(unsafe) {
    return (unsafe || '')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

customElements.define('note-editor', NoteEditor);

// --- DOM Integration ---

function init() {
  const noteList = document.getElementById('note-list');
  const newNoteBtn = document.getElementById('new-note-btn');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const searchInput = document.getElementById('search-input');

  function renderNoteList() {
    if (!noteList) return;
    const notes = store.filteredNotes;
    noteList.innerHTML = notes.map(note => `
      <div class="note-item ${note.id === store.activeNoteId ? 'active' : ''}" data-id="${note.id}">
        <div class="note-title-preview">${_escape(note.title) || 'Untitled Note'}</div>
        <div class="note-content-preview">${_escape(note.content) || 'No content yet...'}</div>
      </div>
    `).join('');

    noteList.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        store.setActiveNote(item.dataset.id);
      });
    });
  }

  function _escape(unsafe) {
    return (unsafe || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
  }

  if (newNoteBtn) {
    newNoteBtn.addEventListener('click', () => store.addNote());
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => store.toggleDarkMode());
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => store.setSearch(e.target.value));
  }

  store.addEventListener('change', renderNoteList);

  // Initial setup
  store.applyTheme();
  renderNoteList();
  if (window.lucide) window.lucide.createIcons();
}

// Start app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
