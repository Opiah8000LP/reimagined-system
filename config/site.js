// Everything you will want to change lives in this file and in playlist.js.
// Text can be a plain string, or { en: '', ru: '', de: '' } to translate it.
// Anything marked `sample: true` shows a [ sample ] tag until you delete that line.

export const SITE = {
  name: 'RDweeb',
  domain: 'rdweeb.xyz',
  goatcounter: 'rdweeb',          // your GoatCounter code, '' turns the counter off. add ?me=1 to the url once to skip your own visits

  // the sentence on the contact page
  note: {
    en: 'Hi, if you want to contact me, please feel free to message me. I try to respond to all messages.',
    ru: 'Привет, если хочешь связаться со мной, смело пиши. Я стараюсь отвечать на все сообщения.',
    de: 'Hi, wenn du mich kontaktieren möchtest, schreib mir gern. Ich versuche, auf jede Nachricht zu antworten.'
  },

  // main links
  github: 'https://github.com/rdweeb',
  kofi: 'https://ko-fi.com/rdweeb',
  email: '',                      // leave empty to hide it
  discord: { handle: 'rdweeb', url: '' },

  // the ones people see on the contact page. add as many lines as you like
  // (or use the "add a link" box on the contact page and paste what it gives you)
  contacts: [
    { label: 'GitHub',     handle: 'rdweeb',  url: 'https://github.com/rdweeb' },
    { label: 'Instagram',  handle: '@rdweeb', url: 'https://instagram.com/rdweeb' },
    { label: 'X',          handle: '@rdweeb', url: 'https://x.com/rdweeb' },
    { label: 'YouTube',    handle: '@rdweeb', url: 'https://youtube.com/@rdweeb' },
    { label: 'SoundCloud', handle: 'rdweeb',  url: 'https://soundcloud.com/rdweeb' },
    { label: 'TikTok',     handle: '@rdweeb', url: 'https://tiktok.com/@rdweeb' }
  ],

  // payments: everything goes through Ko-fi. Robux is the only exception
  payments: { robux: true, robuxUrl: '' },

  // open | soon | closed. price and time can be text or null (shows "to be announced")
  services: [
    {
      id: 'music', status: 'open', price: null, time: null,
      blurb: {
        en: 'Original tracks, beats, edits and remixes: breakcore, dreamy and glitchy electronic music.',
        ru: 'Оригинальные треки, биты, эдиты и ремиксы: брейккор, дримкор и глитч-электроника.',
        de: 'Eigene Tracks, Beats, Edits und Remixe: Breakcore, verträumte und glitchige elektronische Musik.'
      },
      gets: [
        { en: 'A finished, mixed audio file (WAV and MP3)', ru: 'Готовый сведённый аудиофайл (WAV и MP3)', de: 'Eine fertig gemischte Audiodatei (WAV und MP3)' },
        { en: 'Two rounds of changes', ru: 'Два раунда правок', de: 'Zwei Änderungsrunden' },
        { en: 'Stems if you ask for them', ru: 'Стемы по запросу', de: 'Stems auf Anfrage' }
      ]
    },
    {
      id: 'web', status: 'open', price: null, time: null,
      blurb: {
        en: 'Hand-coded websites in plain HTML, CSS and JavaScript, ready for GitHub Pages: portfolios, link hubs and small projects.',
        ru: 'Сайты, написанные вручную на чистых HTML, CSS и JavaScript, готовые для GitHub Pages: портфолио, страницы со ссылками и небольшие проекты.',
        de: 'Handgeschriebene Websites in reinem HTML, CSS und JavaScript, fertig für GitHub Pages: Portfolios, Link-Seiten und kleine Projekte.'
      },
      gets: [
        { en: 'Responsive website files', ru: 'Адаптивные файлы сайта', de: 'Responsive Website-Dateien' },
        { en: 'Help getting it online (GitHub Pages, custom domain)', ru: 'Помощь с публикацией (GitHub Pages, свой домен)', de: 'Hilfe beim Veröffentlichen (GitHub Pages, eigene Domain)' },
        { en: 'The source code is yours to keep', ru: 'Исходный код остаётся у вас', de: 'Der Quellcode gehört dir' }
      ]
    },
    {
      id: 'video', status: 'open', price: null, time: null,
      blurb: {
        en: 'Edits for music videos, showreels, shorts and glitchy montages.',
        ru: 'Монтаж клипов, шоурилов, коротких видео и глитч-монтажей.',
        de: 'Schnitt für Musikvideos, Showreels, Shorts und glitchige Montagen.'
      },
      gets: [
        { en: 'The exported video in the size we agree on', ru: 'Экспортированное видео в согласованном формате', de: 'Das exportierte Video in der vereinbarten Größe' },
        { en: 'One round of changes', ru: 'Один раунд правок', de: 'Eine Änderungsrunde' }
      ]
    },
    {
      id: 'image', status: 'open', price: null, time: null,
      blurb: {
        en: 'Cover art, banners, thumbnails and photo edits in a glitchy or dreamy style.',
        ru: 'Обложки, баннеры, превью и обработка фото в глитчевом или мечтательном стиле.',
        de: 'Cover, Banner, Thumbnails und Bildbearbeitung im glitchigen oder verträumten Stil.'
      },
      gets: [
        { en: 'PNG or JPG export', ru: 'Экспорт в PNG или JPG', de: 'Export als PNG oder JPG' },
        { en: 'The layered file if you ask for it', ru: 'Файл со слоями по запросу', de: 'Die Ebenen-Datei auf Anfrage' }
      ]
    },
    {
      id: 'game', status: 'open', price: null, time: null,
      blurb: {
        en: 'Small playable games and prototypes: mechanics, menus and polish.',
        ru: 'Небольшие игры и прототипы: механики, меню и доводка.',
        de: 'Kleine spielbare Spiele und Prototypen: Mechaniken, Menüs und Feinschliff.'
      },
      gets: [
        { en: 'A playable build', ru: 'Играбельная сборка', de: 'Ein spielbarer Build' },
        { en: 'The project files', ru: 'Файлы проекта', de: 'Die Projektdateien' }
      ]
    },
    {
      id: 'art', status: 'closed', price: null, time: null,
      blurb: {
        en: 'Drawings and illustrations.',
        ru: 'Рисунки и иллюстрации.',
        de: 'Zeichnungen und Illustrationen.'
      },
      gets: [],
      note: {
        en: 'I am still improving my art skills, so art commissions are not open yet. Check back later!',
        ru: 'Я всё ещё прокачиваю навыки рисования, поэтому заказы на арт пока закрыты. Загляните позже!',
        de: 'Ich verbessere noch meine Zeichenkünste, deshalb sind Art-Aufträge noch nicht offen. Schau später wieder vorbei!'
      }
    }
  ],

  // type: music | web | game | video | image
  projects: [
    {
      id: 'dweeb-records', type: 'web', year: 2026, title: 'DWEEB RECORDS',
      blurb: {
        en: 'A tiny purple operating system for the web: a music player, six games, 39 trophies, seasons and a chat bot with 20 emotions.',
        ru: 'Крошечная фиолетовая операционная система для веба: музыкальный плеер, шесть игр, 39 трофеев, сезоны и чат-бот с 20 эмоциями.',
        de: 'Ein winziges lila Betriebssystem fürs Web: Musikplayer, sechs Spiele, 39 Trophäen, Jahreszeiten und ein Chatbot mit 20 Emotionen.'
      },
      tags: ['HTML', 'CSS', 'JavaScript', 'Web Audio'],
      links: [{ label: { en: 'Source', ru: 'Исходники', de: 'Quellcode' }, url: 'https://github.com/rdweeb/dweeb' }]
    },
    {
      id: 'contact-piece', type: 'web', year: 2025, title: 'RDweeb // contact',
      blurb: {
        en: 'A music-reactive contact page: a dome of dust, wireframes and draggable player pieces that react to every kick and hi-hat.',
        ru: 'Контактная страница, реагирующая на музыку: купол из пыли, каркасные фигуры и перетаскиваемый плеер, который реагирует на каждый бочонок и хэт.',
        de: 'Eine musikreaktive Kontaktseite: eine Kuppel aus Staub, Drahtmodelle und verschiebbare Playerteile, die auf jeden Kick und jedes Hi-Hat reagieren.'
      },
      tags: ['Canvas', 'Web Audio', 'JavaScript']
    },
    {
      id: 'sample-music', type: 'music', year: '', title: 'Your first release', sample: true,
      blurb: {
        en: 'A short note about the song: the mood, the tools, the story. Add a listen link below.',
        ru: 'Короткая заметка о песне: настроение, инструменты, история. Добавьте ссылку для прослушивания ниже.',
        de: 'Eine kurze Notiz zum Song: Stimmung, Werkzeuge, Geschichte. Füge unten einen Hör-Link hinzu.'
      },
      tags: ['FL Studio', 'breakcore'],
      links: [{ label: { en: 'Listen', ru: 'Слушать', de: 'Anhören' }, url: 'https://soundcloud.com/rdweeb' }]
    },
    {
      id: 'sample-game', type: 'game', year: '', title: 'Your first game', sample: true,
      blurb: {
        en: 'What you play, what you do, what engine or tools you used.',
        ru: 'Во что играют, что делают, какой движок или инструменты использовались.',
        de: 'Was man spielt, was man tut und welche Engine oder Werkzeuge du genutzt hast.'
      },
      tags: ['prototype']
    },
    {
      id: 'sample-video', type: 'video', year: '', title: 'Your first edit', sample: true,
      blurb: {
        en: 'A music video, a showreel or a glitchy montage. Link it from YouTube or anywhere else.',
        ru: 'Клип, шоурил или глитч-монтаж. Добавьте ссылку на YouTube или куда угодно.',
        de: 'Ein Musikvideo, ein Showreel oder eine glitchige Montage. Verlinke es von YouTube oder woanders.'
      },
      tags: ['edit']
    },
    {
      id: 'sample-image', type: 'image', year: '', title: 'Your first cover', sample: true,
      blurb: {
        en: 'Cover art, a banner or an edit. Add a picture later if you want one on the card.',
        ru: 'Обложка, баннер или обработка. Позже можно добавить картинку на карточку.',
        de: 'Ein Cover, ein Banner oder eine Bearbeitung. Später kannst du ein Bild für die Karte hinzufügen.'
      },
      tags: ['cover art']
    }
  ],

  // the Support page. the Ko-fi button is added for you from `kofi` above
  support: [
    { id: 'robux', label: { en: 'Robux', ru: 'Робуксы', de: 'Robux' }, note: { en: 'The only thing I accept outside of Ko-fi. Ask me for the link.', ru: 'Единственное, что я принимаю помимо Ko-fi. Попросите у меня ссылку.', de: 'Das Einzige, was ich außerhalb von Ko-fi annehme. Frag mich nach dem Link.' }, url: '' },
    { id: 'follow', label: { en: 'Follow and share', ru: 'Подписывайтесь и делитесь', de: 'Folgen und teilen' }, note: { en: 'Free and it helps a lot: follow me, share a song, tell a friend.', ru: 'Бесплатно и очень помогает: подпишитесь, поделитесь песней, расскажите другу.', de: 'Kostenlos und hilft sehr: folge mir, teile einen Song, erzähl es einem Freund.' }, url: 'contact.html' }
  ],

  // listed on the Credits page. add anything new you use
  credits: [
    { name: 'RDweeb', by: 'RDweeb', what: { en: 'All the code, layout, writing and design of this website. It builds on the audio engine and scenes from my earlier contact page.', ru: 'Весь код, вёрстка, тексты и дизайн этого сайта. Основан на аудиодвижке и сценах из моей прежней контактной страницы.', de: 'Der gesamte Code, das Layout, die Texte und das Design dieser Website. Sie baut auf der Audio-Engine und den Szenen meiner früheren Kontaktseite auf.' }, license: 'MIT', url: 'https://github.com/rdweeb' },
    { name: 'GoatCounter', by: 'Martin Tournoij (arp242)', what: { en: 'The privacy-friendly visit counter. I only call its public counting and counter addresses, none of its code is copied.', ru: 'Счётчик посещений, не следящий за людьми. Я использую только его публичные адреса подсчёта, никакой код оттуда не скопирован.', de: 'Der datenschutzfreundliche Besucherzähler. Ich nutze nur seine öffentlichen Zähl-Adressen, es wurde kein Code kopiert.' }, license: 'EUPL-1.2', url: 'https://www.goatcounter.com' },
    { name: 'Ko-fi', by: 'Ko-fi Labs', what: { en: 'Payments, commissions and tips. The site only links to it, nothing is embedded.', ru: 'Платежи, заказы и чаевые. Сайт только ссылается на него, ничего не встроено.', de: 'Zahlungen, Aufträge und Trinkgeld. Die Seite verlinkt nur darauf, nichts ist eingebettet.' }, license: '', url: 'https://ko-fi.com' },
    { name: 'Web Audio API and Canvas 2D', by: 'W3C / WHATWG', what: { en: 'The browser standards behind the beat detection and the animated backgrounds.', ru: 'Стандарты браузера, на которых работают определение битов и анимированные фоны.', de: 'Die Browser-Standards hinter der Beat-Erkennung und den animierten Hintergründen.' }, license: '', url: 'https://developer.mozilla.org/docs/Web/API/Web_Audio_API' },
    { name: 'Spectral flux onset detection', by: 'Simon Dixon (and others)', what: { en: 'The general technique used to find kicks and hi-hats in the music (written from scratch, no code copied). See "Onset Detection Revisited", DAFx-06.', ru: 'Общий метод поиска бочки и хэтов в музыке (написан с нуля, код не копировался). См. «Onset Detection Revisited», DAFx-06.', de: 'Das allgemeine Verfahren, um Kicks und Hi-Hats in der Musik zu finden (selbst geschrieben, kein Code kopiert). Siehe „Onset Detection Revisited“, DAFx-06.' }, license: '', url: '' },
    { name: 'Motion design references', by: 'kkmfd and other motion designers', what: { en: 'Visual inspiration only: the mood, the type and the layering. No images, code or assets from them are used here.', ru: 'Только визуальное вдохновение: настроение, шрифты и наслоения. Никакие изображения, код или материалы оттуда здесь не используются.', de: 'Nur visuelle Inspiration: Stimmung, Schrift und Schichtung. Keine Bilder, kein Code und keine Dateien von ihnen werden hier verwendet.' }, license: '', url: '' },
    { name: 'System fonts', by: 'Your device', what: { en: 'Helvetica, Arial and monospace fonts that already exist on your device. No font files are shipped or downloaded.', ru: 'Шрифты Helvetica, Arial и моноширинные, уже установленные на вашем устройстве. Файлы шрифтов не загружаются.', de: 'Helvetica-, Arial- und Monospace-Schriften, die schon auf deinem Gerät sind. Es werden keine Schriftdateien geladen.' }, license: '', url: '' }
  ],

  // rdweeb.xyz/<name> sends people to a link. lowercase, no slash.
  // do not use the names of real pages (contact, portfolio, services, support, settings, credits): those open the page instead
  shortLinks: { discord: '', youtube: '', music: '' }
};
