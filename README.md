# Лабораторные по веб-программированию

Публичный репозиторий содержит три самостоятельные работы на HTML, CSS и чистом JavaScript. Работы опубликованы на GitHub Pages; история коммитов отражает этапы разработки.

| Работа | Приложение | Материалы |
| --- | --- | --- |
| Лабораторная 1 | [Книжный магазин](https://pzof1.github.io/web/lab1-books-shop/) | [README](lab1-books-shop/README.md), [отчёт](lab1-books-shop/REPORT.md), [защита](lab1-books-shop/DEFENSE.md) |
| Лабораторная 2 | [ToDo](https://pzof1.github.io/web/lab2-todo/) | [README](lab2-todo/README.md), [отчёт](lab2-todo/REPORT.md), [защита](lab2-todo/DEFENSE.md) |
| Лабораторная 3 | [2048](https://pzof1.github.io/web/lab3-2048/) | [README](lab3-2048/README.md), [отчёт](lab3-2048/REPORT.md), [защита](lab3-2048/DEFENSE.md) |

## Требования репозитория

- [Исходный код на GitHub](https://github.com/Pzof1/web).
- [Опубликованная стартовая страница](https://pzof1.github.io/web/) со ссылками на три приложения.
- Публикация GitHub Pages выполняется workflow из `.github/workflows/pages.yml` при изменениях в `main`.
- История Git содержит отдельные этапы работ; обе лабораторные выполнены без CSS- и JavaScript-фреймворков.

## Локальный запуск

Из корня репозитория:

```sh
python3 -m http.server 8000
```

Стартовая страница открывается по адресу `http://localhost:8000/`; приложения доступны в `/lab1-books-shop/`, `/lab2-todo/` и `/lab3-2048/`.
