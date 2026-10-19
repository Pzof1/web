# Web programming labs

Two independent student projects for the Web Programming course:

- `lab1-books-shop/` — responsive book shop with a persistent cart, validated order form, [lab report](lab1-books-shop/REPORT.md), and [defense guide](lab1-books-shop/DEFENSE.md).
- `lab2-todo/` — task manager built with plain JavaScript and DOM APIs.

Both projects use HTML, CSS, and vanilla JavaScript. The work follows the written lab requirements and the instructor's shared review notes: keep assets organized, include a README and favicon, avoid `innerHTML` for building elements, and leave out test dialogs and unused code.

## Work plan

Both labs will be developed in small, reviewable milestones on the single feature branch `feat/web-labs`. The current schedule (Moscow time) is:

- Saturday, 17 October: Books shop commits at 12:17, 14:58, and 17:42; ToDo commit at 13:32.
- Monday, 19 October: Books shop final commit; ToDo commits at 13:58, 17:15, and 20:27.

Each scheduled run should produce one real, reviewable commit and request an independent subagent review. No artificial bugs or activity are introduced. The final ToDo step checks both projects, prepares GitHub Pages, and merges the one feature branch into `main` once if verification passes.

## ToDo progress

- Commit 1: dynamic page shell, DOM-rendered task list, and task creation with a title and date. See [`lab2-todo/README.md`](lab2-todo/README.md) for the current stage and run instructions.
- Later commits: editing and deleting tasks, completion state, status filtering, search, drag-and-drop ordering, and localStorage persistence.

## Projects

The individual lab READMEs document how to run each project and its features. Lab 1 includes a first-person report and a defense walkthrough.
