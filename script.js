$ = (s) => {
  if (s.startsWith("#")) return document.getElementById(s.slice(1));
  if (s.startsWith(".")) return Array.from(document.getElementsByClassName(s.slice(1)));
};

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/sw.js');
// }

const books = [];
loadBooks = async () => {
  const lines = (await (await fetch("/book.md")).text()).trim().split("\n");
  let bi = -1;
  let ci = -1;
  let si = -1;
  lines.forEach((l, i) => {
    if (l.startsWith("Book ")) {
      bi++;
      ci = -1;
      si = -1;
      books[bi] = {
        name: l.trim(),
        chapters: []
      };
    } else if (l.startsWith("  Chapter ")) {
      ci++;
      si = -1;
      books[bi].chapters[ci] = {
        name: l.trim(),
        sections: []
      };
    } else {
      si++;
      books[bi].chapters[ci].sections.push(l.trim());
    }
  });
  // Results: [{
  //   name: "Book 1: ...",
  //   chapters: [{
  //     name: "Chapter 1: ...",
  //     sections: [
  //       "...",
  //     ]
  //   }, {...}]
  // }, {...}]
};

mdToHtml = (md) => {
  return `<p class="first">` + md
  .replace(/([^ ]+)/, "<span>$1</span>")
  .replaceAll(/[\n]+([^<])/g, "</p>\n<p>$1")
  .replaceAll("<p>>", `<p class="quote">`)
  .replaceAll(" -- ", " — ")
  .replaceAll(/[_]([^_]+)[_]/g, "<i>$1</i>")
  .replaceAll(/[*][*]([^*]+)[*][*]/g, "<b>$1</b>")
  .replaceAll(/[~][~]([^~]+)[~][~]/g, "<s>$1</s>")
  + "</p>"
};

class Page {
  constructor(path) {
    this.path = path;
    [this.book, this.chapter, this.section] = this.parsePath(path);
    this.book_name = books[this.book].name;
    this.chapter_name = books[this.book].chapters[this.chapter].name;
    this.section_name = books[this.book].chapters[this.chapter].sections[this.section];
    this.file = `/${this.book_name}/${this.chapter_name}/${this.section_name}.md`;
  }

  parsePath(path) {
    let [book, chapter, section] = path.replaceAll("/", "").split(".");
    book--;
    chapter--;
    section--;
    if (
      Number.isNaN(book) || book < 0 || book + 1 > books.length ||
      Number.isNaN(chapter) || chapter < 0 || chapter + 1 > books[book].chapters.length ||
      Number.isNaN(section) || section < 0 || section + 1 > books[book].chapters[chapter].sections.length
    )
      [book, chapter, section] = [0, 0, 0];

    return [book, chapter, section];
  }

  makePagePath(book, chapter, section) {
    return `/${book+1}.${chapter+1}.${section+1}`;
  }

  prevPagePath() {
    if (this.section > 0)
      return this.makePagePath(this.book, this.chapter, this.section-1);
    if (this.chapter > 0)
      return this.makePagePath(this.book, this.chapter-1, books[this.book].chapters[this.chapter].sections.length-1);
    if (this.book === 0)
      return undefined;

    lastChapter = books[this.book-1].chapters.length-1
    return this.makePagePath(this.book-1, lastChapter, books[this.book-1].chapters[lastChapter].sections.length-1);
  }

  nextPagePath() {
    if (this.section < books[this.book].chapters[this.chapter].sections.length-1)
      return this.makePagePath(this.book, this.chapter, this.section+1);
    if (this.chapter < books[this.book].chapters.length-1)
      return this.makePagePath(this.book, this.chapter+1, 0);
    if (this.book === books.length-1)
      return undefined;

    return this.makePagePath(this.book+1, 0, 0);
  }
}

skipLoading = () => {
  const localDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const crawlers = new RegExp(([
    /bot/, /spider/, /crawl/,
    /APIs-Google/, /AdsBot/, /Googlebot/,
    /bing/, /yandex/, /baidu/, /duckduck/, /yahoo/,
    /facebook/, /instagram/, /pinterest/, /reddit/,
  ]).map((r) => r.source).join("|"), "i");
  const crawler = !!navigator.userAgent.match(crawlers);
  return localDev || crawler;
};
loadPage = async (page) => {
  const loadingDelay = skipLoading() ? 1 : 1000;
  const now = Date.now();
  data = await (await fetch(page.file)).text();
  setTimeout(() => {
    $("#content").innerHTML = mdToHtml(data);
    $("#for-love").classList.remove("hidden");
    $(".prev-page").forEach(e => e.href = page.prevPagePath());
    $(".next-page").forEach(e => e.href = page.nextPagePath());
  }, loadingDelay - (Date.now() - now));
};

document.addEventListener('DOMContentLoaded', async () => {
  $("#open-menu").addEventListener('click', () => {
    $('#menu').classList.add("visible");
  });
  $("#close-menu").addEventListener('click', () => {
    $('#menu').classList.remove("visible");
  });
  await loadBooks();
  page = new Page(window.location.pathname);
  await loadPage(page);
});
