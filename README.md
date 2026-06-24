# KS3 Maths Practice

A small static website of self-practice maths activities for KS3 students,
hosted free on GitHub Pages at **https://marcinkempka.github.io**.

Students land on a welcome page, pick their year group (7, 8 or 9), and choose
an activity. Everything runs in the browser — no login, no server, no database.
Each student's scores save to their own device only.

---

## How the project is organised

### The shell (the pages students navigate)
| File | What it is |
|------|------------|
| `index.html` | Welcome page. Links to the three year groups. |
| `year7.html` | Year 7 section — lists Year 7 activities. |
| `year8.html` | Year 8 section — lists Year 8 activities. |
| `year9.html` | Year 9 section — lists Year 9 activities. |
| `style.css`  | **Shared** styling for all four pages above. Edit this to restyle the shell. |

### The quizzes
| File | What it is |
|------|------------|
| `quiz.css` | **Shared** styling for every quiz. Edit this to restyle all quizzes at once. |
| `quiz.js`  | **Shared** quiz engine (scoring, shuffling, feedback). Edit this to change how all quizzes behave. |
| `y8-negative-numbers.html` | An individual quiz. Contains only its title, accent colour, and questions. |

The key idea: **look and behaviour live in the shared files (`style.css`,
`quiz.css`, `quiz.js`). Individual quiz files hold only their own questions.**
So restyling the whole site is one or two edits, not one per quiz.

---

## Year accent colours
- Year 7 — indigo `#4F46E5`
- Year 8 — teal `#0D9488`
- Year 9 — rose `#DB2777`

---

## How to add a new quiz

1. **Copy** an existing quiz file (e.g. `y8-negative-numbers.html`) and rename it
   with the pattern `y{year}-{topic}.html`, e.g. `y9-solving-equations.html`.
2. In the new file, change:
   - the `<title>`
   - the accent in `<body style="--accent:#xxxxxx">` (use the year colour above)
   - the eyebrow and `<h1>` heading text
   - the two `Back to Year X` links
   - the `window.QUIZ` block at the bottom: a unique `storeKey` and the `questions` array.
3. **Add a card** to the matching year page (`year{N}.html`) inside
   `<section class="quiz-grid">`:
   ```html
   <a class="quiz-card" href="y9-solving-equations.html">
     <span class="topic">Algebra</span>
     <span class="title">Solving Equations</span>
     <span class="meta">10 questions &middot; multiple choice</span>
     <span class="open">Start <span class="arrow">&rarr;</span></span>
   </a>
   ```
4. If that year page still shows the "Quizzes are on the way" empty-state block,
   delete it once a real card is present.

### Question format
```js
{ q:"-6 × 4", answer:"-24",
  options:["-24","24","-2","10"],
  why:"Short explanation shown after answering." }
```
- `q` is the question (the engine adds the “=”).
- `answer` must exactly match one of the `options`.
- `options` can be 2–6 choices; they are shuffled automatically.
- `why` is the one-line feedback shown after the student answers.

---

## Hosting notes
- This is a GitHub Pages site. Committing to the default branch publishes it
  automatically within a minute or two.
- Fonts load from Google Fonts, so viewing needs an internet connection.
- Quiz scores use the browser's `localStorage`, which works once hosted.

## Coming later
- Some activities will be quizzes (interactive, like the current one).
- Some will be handouts that show worked answers. These will be added as their
  own files and linked from the year pages in the same way.
