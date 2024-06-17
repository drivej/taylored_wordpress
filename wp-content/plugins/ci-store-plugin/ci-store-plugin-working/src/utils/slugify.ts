export function slugify(input: string, id?: string | number, defaultSlug = 'swell'): string {
  const removeStopWords = input.split(/\s+/g).length > MAX_SLUG_WORDS; // if source string has few words, don't replace stop words

  const output = input
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(specialCharsRegEx, (c) => specialCharsTo.charAt(specialCharsFrom.indexOf(c))) // Replace special characters
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(removeStopWords ? stopWordsReg : /^\?/, '') // remove stop words (english only)
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
    .split('-')
    .slice(0, MAX_SLUG_WORDS) // grab 5 words (optimal 3-5 words)
    .join('-')
    .replace(/$/, id != undefined ? `-${id}` : ''); // optionally add id into slug
  return encodeURIComponent(output || defaultSlug);
}

const MAX_SLUG_WORDS = 5;
const specialCharsFrom = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
const specialCharsTo = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
const specialCharsRegEx = new RegExp(specialCharsFrom.split('').join('|'), 'g');
const stopWordsReg =
  /\b(a|about|above|actually|after|again|against|all|almost|also|although|always|am|an|and|any|are|as|at|be|became|become|because|been|before|being|below|between|both|but|by|can|could|did|do|does|doing|down|during|each|either|else|few|for|from|further|had|has|have|having|he|hed|hell|hence|hes|her|here|heres|hers|herself|him|himself|his|how|hows|i|id|ill|im|ive|if|in|into|is|it|its|its|itself|just|lets|may|maybe|me|might|mine|more|most|must|my|myself|neither|nor|not|of|oh|on|once|only|ok|or|other|ought|our|ours|ourselves|out|over|own|same|she|shed|shell|shes|should|so|some|such|than|that|thats|the|their|theirs|them|themselves|then|there|theres|these|they|theyd|theyll|theyre|theyve|this|those|through|to|too|under|until|up|very|was|we|wed|well|were|weve|were|what|whats|when|whenever|whens|where|whereas|wherever|wheres|whether|which|while|who|whoever|whos|whose|whom|why|whys|will|with|within|would|yes|yet|you|youd|youll|youre|youve|your|yours|yourself|yourselves)\b/g;
