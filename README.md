# ГРУД

Статический прототип сайта

## Структура проекта

```
project/
├── index.html               — разметка
├── css/
│   ├── base.css             — reset, переменные :root, типографика
│   ├── layout.css           — header, nav, breadcrumbs, footer
│   ├── components.css       — hero, слайдер, карточки, кнопки, фильтры
│   └── pages.css            — реестр, поиск, указатели, детальная
├── js/
│   ├── data.js              — массивы documents, archivesData, names, geo
│   ├── utils.js             — el, escapeHtml, renderEmpty, цитата, toast
│   ├── router.js            — route, goTo, showPage
│   ├── components/
│   │   ├── document-card.js — карточка документа
│   │   ├── steam-slider.js  — главный слайдер на главной
│   │   ├── hero-search.js   — живой поиск с подсказками
│   │   ├── to-top.js        — кнопка «Наверх»
│   │   ├── copy-cite.js     — кнопка «Скопировать цитату»
│   │   └── doc-nav.js       — обработчики переходов
│   └── app.js               — рендер страниц и инициализация
├── assets/
│   └── images/              — логотипы и картинки
└── README.md
```

## Порядок подключения скриптов

Каждый компонент — отдельный файл. Порядок подключения в index.html важен:

```
data → utils → router → components/* → app.js
```

`app.js` вызывается последним и запускает инициализацию.


## Где менять контент

| Что | Файл |
|-----|------|
| Список документов, архивов, персон, топонимов | `js/data.js` |
| Картинки слайдера на главной | `js/components/steam-slider.js` → `slideBanners` |
| Ссылки на популярные документы (чипы) | `index.html` → `.hero__hint` |
| Тексты статей | `index.html` |
| Стили | `css/*.css` |


## Стек

- **HTML5** — разметка
- **CSS3** — Grid, Flexbox, CSS-переменные
- **Vanilla JavaScript (ES6)** — без сборщика и зависимостей
- **Splide 4** — слайдер «Похожие документы» (только на странице детальной)
- **Google Fonts** — PT Sans + PT Serif