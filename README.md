# Wiki Translate

Translate terms using wikipedia articles!

# Why would I do this?

Sometimes you know a term in one language but not in another,
but when it comes to terms with multiple words or from specific field of study
dictionaries and Google Translate can only take so far.

In such cases, looking for the Wikipedia article of the thing I want to
translate and changing the language faster, more accurate and more usefull than
trying to google the term and wondering what I find is a correct translation
in this specific context.

# What does this do?

These functions wrap the [Wikipedia API](https://en.wikipedia.org/w/api.php?action=help&modules=main)
nicelly to browse Wikipedia for matching articles, and then allow you to
retrieve the title and URL of the same article for another language.

# How do I use this?

_See <https://simple.wikipedia.org/wiki/List_of_Wikipedias> for a full list of language codes_

```javascript
// Search for "Python" in German
const pages = await search("Python", "de");
// Get an object with the title and url of the spanish language version of the article
const translation = await getTranslation(pages[0].pageid, "de", "es");

console.log(translation.title, translation.url);
```
