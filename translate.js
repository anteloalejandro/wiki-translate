/**
 * @typedef LangLink
 * @prop {string} title article title
 * @prop {string} url link to article
 * @prop {string} lang target language code
 * @prop {string} langname full language name
 * @prop {string} autonym full translated language name
 *
 * @typedef PageProps
 * @prop {''} disambiguation
 *
 * @typedef Pages
 * @prop {string} title
 * @prop {number} pageid
 * @prop {string} title
 * @prop {string} timestamp
 * @prop {LangLink[]?} langlinks
 * @prop {PageProps[]?} pageprops
 *
 * @typedef Query
 * @prop {any} searchinfo
 * @prop {unknown} pages
 * @prop {Pages} search
 *
 * @typedef WikiResponse
 * @prop {Query} query
 */

const init = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "omit",
  method: "GET",
  mode: "cors"
}

/** 
 * @param {string} term Term to search for.
 * @param {string} langCode Source language of the term.
 * @link https://simple.wikipedia.org/wiki/List_of_Wikipedias
 * @returns {Promise<Pages[]>} A list of pages, with id. title, timestamp, and more
 * @example const pages = await search("Python", "de");
 **/
export async function search(term, langCode) {
  // INFO: https://www.mediawiki.org/wiki/API:Main_page
  const req = await fetch(
    `https://${langCode}.wikipedia.org/w/api.php?` + new URLSearchParams({
      utf8: 1,
      format: "json",
      action: "query",
      // INFO: https://en.wikipedia.org/w/api.php?action=help&modules=query%2Bsearch
      list: "search",
      srsearch: term,
      srprop: "snippet|timestamp",
    }),
    init
  );

  /** @type {Pages[]} result */
  const result = (await req.json()).query.search;

  const pagePropsReq = await fetch(
    `https://${langCode}.wikipedia.org/w/api.php?` + new URLSearchParams({
      utf8: 1,
      format: "json",
      action: "query",
      // INFO: https://en.wikipedia.org/w/api.php?action=help&modules=query%2Bpageprops
      prop: "pageprops",
      ppprop: "disambiguation",
      titles: result.map(s => s.title).join('|'),
    }),
  );
  const pagePropsRes = (await pagePropsReq.json()).query.pages;
  const pagesWithProps = Object.keys(pagePropsRes)
    .map(k => pagePropsRes[k])
    .filter(o => Object.hasOwn(o, "pageprops"))
    .map(o => o.pageid);
  const filteredSearch = result.filter(s => !pagesWithProps.includes(s.pageid));

  return filteredSearch;
}

/**
 * @param {number} id Page id obtained through `search()`
 * @param {string} langCodeSource
 * @param {string} langCodeTarget 
 * @returns {Promise<LangLink>} An object with the title and link of the translated article.
 * @example
 * const pages = await search("Python", "de");
 * const translation = await getTranslation(pages[0].pageid, "de", "es");
 */
export async function getTranslation(id, langCodeSource, langCodeTarget) {
  const req = await fetch(
    `https://${langCodeSource}.wikipedia.org/w/api.php?` + new URLSearchParams({
      utf8: 1,
      format: "json",
      action: "query",
      pageids: id,
      // INFO: https://en.wikipedia.org/w/api.php?action=help&modules=query%2Blanglinks
      prop: "langlinks",
      llprop: "url|langname|autonym",
      lllang: langCodeTarget,
    }),
    init
  );
  const langlinks = (await req.json()).query.pages[id].langlinks
  if (!langlinks || !langlinks.length) return null;
  const langlink = langlinks[0];
  langlink.title = langlink['*'];
  return langlink;
}
