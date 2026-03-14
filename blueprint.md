# **Notepad App Blueprint**

## **Overview**
A sophisticated, framework-less web application for managing personal notes. Built using modern web standards (ES Modules, Web Components, and Baseline CSS features), it provides a seamless, responsive, and aesthetically pleasing experience.

## **Project Outline**
*   **Core Architecture:** Vanilla JavaScript with ES Modules and Custom Elements.
*   **State Management:** Reactive local state with LocalStorage persistence.
*   **Visual Design:**
    *   **Typography:** Inter (or system sans-serif) for readability.
    *   **Color Palette:** Vibrant OKLCH colors with semantic roles.
    *   **Effects:** Multi-layered drop shadows, glassmorphism, and subtle background noise.
    *   **Layout:** Responsive split-pane (sidebar/content) with container queries.
*   **Features:**
    *   **Create/Edit Notes:** Full-screen editor for focused writing.
    *   **Search & Filter:** Real-time search by title or content.
    *   **Dark Mode:** Built-in theme toggle with persistent user preference.
    *   **Persistence:** Automatic saving to browser LocalStorage.
    *   **Categories/Colors:** Ability to tag notes with distinct colors.
    *   **A11Y:** Semantic HTML, keyboard navigation, and high contrast support.

## **Current Implementation Plan**
### **Phase 1: Foundation & Layout**
1.  **HTML Structure (`index.html`):** Set up the main shell with a sidebar and an editor area.
2.  **Base Styling (`style.css`):** Define OKLCH variables, base typography, and the layout system using CSS Grid/Flexbox.
3.  **Web Components (`main.js`):**
    *   `<note-card>`: Individual note preview in the list.
    *   `<note-editor>`: Main editor interface.

### **Phase 2: Core Logic & Features**
1.  **State Manager:** Implement a simple observable state for notes.
2.  **Storage Service:** Handle LocalStorage sync.
3.  **Editor Logic:** Implement real-time updates and auto-save.

### **Phase 3: Refinement & Polish**
1.  **Search Functionality:** Filter the note list based on input.
2.  **Visual Effects:** Add noise texture, animations for adding/removing notes.
3.  **Responsive Tweaks:** Ensure a great mobile experience with drawer-style navigation.

---

## **Action Items for This Request**
*   [x] Create a comprehensive `blueprint.md`.
*   [ ] Refactor `index.html` for the notepad layout.
*   [ ] Create a comprehensive `style.css` with modern Baseline features.
*   [ ] Implement the core `main.js` with Web Components and State Management.
*   [ ] Set up LocalStorage persistence.
