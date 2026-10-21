---
title: quote-fidelity stage
date: 2026-10-13
summary: catching altered statute quotes in AI-drafted family-law documents — 90% recall at 94.7% precision, with one big caveat
draft: true
---

The quote-fidelity stage checks every passage of Alaska statute or court-rule text quoted in an AI-drafted family-law document against the real source, and flags the ones that were changed. On the 200-document benchmark it catches 36 of 40 planted alterations (90% recall) at 94.7% precision on answer-key quotes, with one large caveat: 35 of the 40 alterations are the same appended phrase.

## What this stage is for

The stage answers one question per passage: does this quoted text say what the law actually says? A citation can be real and still be misused, if the words attributed to it were changed.

AI drafting tools produce legal documents that look authoritative. Two kinds of error make them dangerous:

- **Fabricated citations:** an authority that does not exist, such as AS 25.24.946. The existence stage catches these.
- **Altered quotes:** a real authority, quoted with its words changed. This stage catches these.

Altered quotes are harder to spot because everything around them checks out. The citation exists, the passage reads like statute text, and most of the words are right. A single change can reverse the law:

| Source says | Draft says | Effect |
|---|---|---|
| the court **shall** consider | the court **may** consider | A duty becomes optional |
| a court may **not** deny a petition | a court may deny a petition | A protection is removed |
| **primary** physical custody | **sole** physical custody | A different custody arrangement |
| ...breakdown of the marriage | ...breakdown of the marriage **under all circumstances** | A rule with no exceptions |

A self-represented litigant relying on a document like this could argue the wrong standard in court. The stage exists so the ProSe AI detector can flag these passages before a person relies on them.

**Scope:** quotes from Alaska statutes (AS), the Civil Rules and the Evidence Rules. Every quote in the benchmark answer key comes from one of these. Quotes from case law are out of scope.

## Where it fits

Quote fidelity is the third stage of the hallucinated-citation detector. It runs alongside the existence check, and both read the same corpus.

The two checks split the work by what can go wrong. Existence asks whether the cited authority is real. Quote fidelity asks whether the words attributed to a real authority are its actual words. They also cover for each other: when a planted fabricated citation sits in front of a quote, quote fidelity finds no source text and steps aside (tier `no_source`), and existence flags the citation instead.

The benchmark labels them separately, which the data dictionary calls Stage 2 (`exists`) and Stage 3 (`quote_status`). Extraction is shared, but quote fidelity needs more than citations: it needs the passages themselves, which is why it brings its own extractors (walkthroughs 2 and 3).

## The data

The stage is measured on 163 labeled quotes across 200 benchmark documents: 123 faithful and 40 altered.

**Benchmark documents** (`data/benchmark/documents/doc-NNNN.docx`). These are 200 AI-generated Alaska family-law documents (custody motions, dissolution petitions, protective-order filings and so on) with fictional parties. About half are clean, meaning no errors were planted. The rest are corrupt: one to three citations were replaced with fabricated ones and/or one quoted passage was altered.

**Answer key** (`data/benchmark/answer-key.json`). One record per document. Its `quotes` array lists every verbatim passage the document drew from a source:

| Field | Meaning |
|---|---|
| `source_cite` | The authority the passage came from, e.g. AS 25.24.160(a) |
| `quote_status` | `faithful` or `altered`. This is the label the stage is scored against. |
| `injected` | `false`, or `altered_quote` for a planted alteration |
| `original_text` / `altered_text` | Altered quotes only: the source wording and the changed wording |

The answer key does not record the text of faithful quotes, only their citation. That shapes how the evaluation pairs extracted passages with key entries (see Code walkthrough 5).

**Citation corpus** (`data/corpus/*.jsonl`). The ground truth for what the law says. Three files matter here, each with a quirk the code must handle:

| File | One record per | Quirk |
|---|---|---|
| `statutes.jsonl` | statute section | Repealed sections store the string `"None"` as their text, not a null |
| `rules.jsonl` | civil-rule subrule | Civil Rule 90.3 appears once each for (a), (b), (c)... and must be joined into one text |
| `rules-evidence.jsonl` | evidence-rule record | No `citation` field (it must be built from `ruleNumber`), and commentary records are mixed in |

All three files carry PDF line breaks in the middle of sentences (`A child\nsupport award`), which would stop an exact match.

**What the planted alterations look like.** The 40 alterations come in only four forms:

| Alteration | Count |
|---|---|
| "under all circumstances" appended to the end | 35 |
| primary → sole | 2 |
| shall → may | 2 |
| not deleted | 1 |

Every alteration keeps most of the original wording. That is why simple similarity scores are not enough, and why the narrow mix of alterations matters when reading the results (see Decisions and caveats).

## How it works

Every passage goes through the same three steps: find it, look up its source, then compare from strictest to loosest test until one decides.

Only two outcomes are flags or passes. A clean match (exact or normalized) is **faithful**. A passage with no clean match that still scores 70 or more against its source is **altered**, because it is clearly that source with words changed. Everything else is set aside rather than guessed at: a passage with no findable source, or one so unlike its source (under 70) that it is not a quote of it at all. The next five sections walk through the code behind each step.

## Code walkthrough 1: source_lookup.py

`source_lookup.py` turns a citation, written any way a document writes it, into the full text of that statute or rule. Everything else in the stage depends on it.

It exposes three functions:

| Function | Input → output |
|---|---|
| `clean_whitespace(text)` | Any text → the same text with every run of spaces, tabs and newlines collapsed to one space |
| `load_corpus()` | The three corpus files → one dictionary of `{normalized citation: source text}` |
| `get_source_text(cite, corpus)` | Any citation spelling → its source text, or `None` |

**Loading the corpus.** `load_corpus` reads each file and funnels every record through one helper, `add()`, which handles the corpus quirks in one place:

```python
def add(cite: str, text: str | None) -> None:
    # Repealed sections store the string "None" rather than null.
    if not text or text == "None":
        return
    texts.setdefault(normalize_citation(cite), []).append(text)
```

- Repealed statutes are dropped, so a quote citing one has no source and is never judged.
- Civil subrules all share one citation, so `setdefault(...).append` collects (a), (b), (c)... into a list in file order.
- Evidence rules have no citation field. The loop builds one, `f"Alaska R. Evid. {r['ruleNumber']}"`, and skips records whose `type` is `rule_commentary`.

At the end, each list is joined with spaces and passed through `clean_whitespace`, which removes the PDF line breaks:

```python
return {cite: clean_whitespace(" ".join(pieces)) for cite, pieces in texts.items()}
```

**Looking up a citation.** Both the dictionary keys and the lookup go through `normalize_citation` from the existing extractor. It strips pinpoints and rewrites rule spellings to one canonical form, so all of these find the same text:

```text
Civil Rule 90.3(a)   Rule 90.3(a)(1)   Alaska R. Civ. P. 90.3   →   "Alaska R. Civ. P. 90.3"
```

The consequence is that a quote cited to AS 25.24.150(c) is checked against all of section 150, not just subsection (c). This is covered under Limitations.

**Result:** all 163 answer-key quotes resolve to source text. A fabricated citation such as AS 25.24.946 returns `None`.

## Code walkthrough 2: quote_extractor.py

`quote_extractor.py` finds every passage in quote marks and attaches it to the citation it is quoting. It returns the quote text exactly as written. Normalizing it is the checker's job.

```text
...Civil Rule 90.3(a), which provides that "a child support award ..."
   ^^^^^^^^^^^^^^^^^^                      ^^^^^^^^^^^^^^^^^^^^^^^^
   attached citation                       the quote
```

Four functions, run in order for each paragraph of the .docx:

1. `find_quotes(paragraph)` matches text between straight quotes (`"([^"]*)"`) and between curly quotes (`“([^”]*)”`), and records each quote's character positions. `[^"]*` stops at the next quote mark, so straight quotes pair up in order: the 1st with the 2nd, the 3rd with the 4th.
2. `is_legal_quote(quote, paragraph)` throws out quotes that are not quotations of law:
   - anything under 3 words (`MIN_QUOTE_WORDS`), which removes most defined terms such as "Petitioner"
   - defined-term labels, detected by *hereinafter* in the 20 characters before the quote
3. `attach_citation(paragraph, quote_start)` runs the four citation regexes from the existing extractor (statute, civil rule, Alaska R. Civ. P., evidence rule) and picks the match that ends closest before the quote. It returns the citation as written, for example `AS 25.24.160(a)(4)(F)`.
4. `extract_quotes(docx_path)` loops over paragraphs with python-docx and returns one record per kept quote:

```python
{"doc_id": ..., "paragraph_index": ..., "text": ..., "start": ..., "end": ..., "citation": ...}
```

**Known weaknesses**, which the later stages had to work around:

- **Quotes without quote marks are invisible.** On the benchmark, 47 of the 54 answer-key quotes this extractor misses have no quote marks at all. Code walkthrough 3 exists to fix that.
- **Nearest-citation-before is a guess.** Testimony such as "make Ashley regret it" gets attached to whatever statute was cited earlier in the paragraph. The checker's "unrelated" floor (walkthrough 4) stops these from being flagged as altered.
- **A citation after the quote is never used.** If the citation follows the quote, the quote gets no citation or the wrong one.

The regex names are shared with the main extractor. When main renamed `CIVIL_RULE_RE` to `RULE_RE`, this file's import broke, and it was updated in the merge.

## Code walkthrough 3: unquoted_passages.py

`unquoted_passages.py` finds statute text that a draft copied straight into a sentence, with no quote marks, so the checker can judge it too. It raised the number of altered quotes extracted from 23 to 38 of 40.

Drafts do this constantly:

```text
Under AS 25.24.200, a petition for dissolution of marriage may be filed when
incompatibility of temperament has caused the irremediable breakdown of the
marriage under all circumstances. The statute requires...
```

There is no quote mark to find, so the module searches from the other direction: it takes the source text of every authority cited nearby and looks for long stretches of the paragraph that match it word for word.

**Step 1: gather nearby sources.** `extract_passages` collects the citations in the paragraph *and in the paragraph before it*, using the same four regexes. Unlike the quote extractor, it does not care whether a citation comes before or after the passage. Each citation is looked up with `get_source_text`, and duplicates of the same source are dropped.

**Step 2: tokenize both texts the same way.** `_words` splits text into words while keeping each word's character position, so a match can be cut back out of the original paragraph:

```python
text = LIST_MARKER_RE.sub(lambda m: " " * len(m.group()), text.translate(_PUNCT_MAP))
return list(WORD_RE.finditer(text))
```

Curly quotes are straightened and list markers such as `(1)` are blanked out. Both steps replace characters one for one, so positions stay valid.

**Step 3: find verbatim runs.** Python's `difflib.SequenceMatcher` aligns the paragraph's words against the source's words. Any matching block of at least 8 words (`MIN_RUN`) counts as copied text:

```python
matcher = SequenceMatcher(None, para_tokens, source_tokens, autojunk=False)
return [b for b in matcher.get_matching_blocks() if b.size >= MIN_RUN]
```

**Step 4: extend the run only for an appended ending.** This is the core judgment call. Unquoted text is usually paraphrase: a drafter copies some statute words, then continues in their own words. That is not a misquote, so a run normally ends where the match ends. It is extended only when both of these hold:

- **The run reaches the end of a source clause.** `_ends_clause` checks that the next character in the source after the matched words is punctuation, or the end of the text.
- **The draft adds 1 to 4 words (`MAX_TAIL`) before its own punctuation.** `_appended_end` measures those words. A tail containing a citation, such as *under AS 25.24.150*, is attribution and does not count.

In the example, the source sentence ends at "marriage", and the draft adds "under all circumstances" before its period. So the passage becomes the copied text plus those three words, and the checker scores it as altered.

```text
source:  ...the irremediable breakdown of the marriage.
draft:   ...the irremediable breakdown of the marriage under all circumstances.
                                                   └───── tail: 3 words ─────┘
```

The period rule needed care. `CLAUSE_END_RE` treats `.` as a clause end only before a space or the end, so the dots inside `AS 18.66.100` do not cut a citation in half. Before this fix, *under AS 18* was read as three added words and flagged.

**Step 5: clean up.** When two sources match overlapping text, only the longest passage is kept. Passages overlapping a quoted passage are skipped, since the quote extractor already has them. Each result carries `"quoted": False` so results can be split by type.

**What was tried and removed.** A first version also merged runs separated by 1–2 different words, to catch swaps like *shall → may* in unquoted text. It caught none of the planted alterations and raised about 600 false alarms, because a changed word in unquoted text is ordinary paraphrase. The docstring records why it is gone, so nobody adds it back.

## Code walkthrough 4: quote_fidelity.py

`check_quote(quote, source)` decides whether one passage is faithful to its source text. It tries cheap, strict tests first and stops at the first one that gives an answer:

| Tier | Test | Verdict | Score |
|---|---|---|---|
| `no_source` | Citation missing, fabricated or repealed | not judged | none |
| `exact` | The quote is a substring of the source | faithful | 100 |
| `normalized` | The quote matches once formatting differences are ignored | faithful | 100 |
| `fuzzy` | Similarity to the closest stretch of source is 70–99 | **altered** | 70–99 |
| `unrelated` | Similarity is below 70: this is not a quote of this source | not judged | 0–69 |

The function returns a small dictionary that explains itself:

```python
{"tier": "fuzzy", "score": 84.9, "faithful": False, "closest": "the physical emotional ... of the child 2 the"}
```

**Tier 1, exact.** After `clean_whitespace`, a plain substring test: `clean_whitespace(quote) in source`.

**Tier 2, normalized.** `normalize_text` erases the differences that legal quoting legitimately introduces:

```python
text = unicodedata.normalize("NFKC", text).translate(_PUNCT_MAP)   # curly quotes, dashes
text = LIST_MARKER_RE.sub(" ", text).lower()                       # (1), (e), (iv)
return clean_whitespace(re.sub(r"[^\w\s]", " ", text))            # punctuation
```

Two legal conventions get special handling, through `GAP_RE`:

- **Ellipses** (`...`, `…`, `. . .`) mark omitted text.
- **Brackets** mark an editor's change, as in `allocate[s]`.

The quote is split at each gap, and `_segments_in_order` checks that every piece appears in the source, in order. Each piece is padded with spaces so *custody* cannot match inside a longer word. Pieces in the wrong order fail.

The list-marker and bracket rules were added after the threshold sweep surfaced three faithful passages scoring 95–99. One was *fairly allocate[s] the economic effect*; another dropped a `(1)` that sits mid-sentence in AS 18.66.100(e).

**Tier 3, fuzzy.** Anything left gets a similarity score in two steps:

```python
align = fuzz.partial_ratio_alignment(norm_quote, norm_source)    # A: find the closest window
closest = norm_source[align.dest_start:align.dest_end]
score = fuzz.ratio(norm_quote, closest)                           # B: score the whole quote against it
```

- **Step A** slides a quote-sized window along the source and keeps the position that matches best. Comparing a 20-word quote against a 2,000-word statute directly would always score low.
- **Step B** scores the whole quote against that window, from 0 to 100, based on how many character edits separate them.

Step B looks redundant, since step A already produces a score. It is not. When the quote is *longer* than the source, `partial_ratio` flips and searches for the source inside the quote, so a short source quoted in full with words added scores a perfect 100. In a test case, the step A score was 100.0 and the step B score was 58.0. A unit test guards this so the step is never "simplified" away.

**Worked example.** Quote: "the physical, emotional, mental, religious, and social needs of the child under all circumstances".

```text
quote:    the physical emotional mental religious and social needs of the child under all circumstances
closest:  he physical emotional mental religious and social needs of the child 2 the capability and des
score:    84.9   →  70 ≤ 84.9 < 100  →  altered
```

**The two settings.** Both are module constants, chosen by the threshold analysis:

```python
FUZZY_THRESHOLD = 100.0   # any fuzzy-tier quote is altered: "no clean match"
UNRELATED_BELOW = 70.0    # below this, the quote is not from this source at all
```

## Code walkthrough 5: the evaluation scripts

Two scripts measure the stage. Neither one lets the answer key influence a prediction: predictions come only from the document text and the corpus, and the key is used only to pair and to score.

### evaluate_quotes.py

For each of the 200 documents, it extracts passages, pairs each answer-key quote with one extracted passage, runs `check_quote`, and tallies the results.

Pairing is the hard part, because the answer key has no text for faithful quotes, and 6 documents quote the same citation twice with one copy faithful and one altered. So the script pairs in two passes per document:

1. **Altered quotes first, by text.** `find_altered` looks for the extracted passage that contains the whole `altered_text`. Only if none does, it accepts a passage that is part of it. The order matters: an early version accepted either, and a short phrase elsewhere ("crime involving domestic violence") stole the match from the real altered quote.
2. **Faithful quotes second, by citation.** `find_faithful` takes the first unused passage whose citation normalizes to the key's `source_cite`.

Each paired passage is scored. A passage counts as flagged only when the checker returns `faithful: False`, so `unrelated` and `no_source` passages are never flagged.

What it reports:

- extraction coverage for altered and faithful quotes, and how many came from unquoted text
- precision, recall and F1 for the altered class, two ways: the checker on extracted passages only, and end to end, where an answer-key quote never extracted counts as not flagged
- a breakdown by tier
- flags on extracted passages that match no answer-key quote. Every planted alteration is in the key, so these are false alarms.

It writes every scored passage to `data/quote-fidelity-results.json`. `--quoted-only` skips the unquoted-passage finder, which gives the baseline used for comparison.

Altered is the positive class because it is the rare, costly one. The data is 3:1 faithful, so a detector that called everything faithful would already score 75% accuracy while catching nothing.

### sweep_threshold.py

It re-reads the saved results and recomputes the metrics for every combination of settings, so a sweep takes about a second instead of re-extracting 200 documents. A passage is flagged when:

```python
item["tier"] in ("fuzzy", "unrelated") and floor <= item["score"] < threshold
```

It prints a threshold sweep (no floor), a floor sweep at the current threshold, and the raw fuzzy scores for each class. Those scores are what the threshold analysis below is built on.

## Threshold analysis

The threshold is 100 and the floor is 70, because that is where the data separates: altered quotes are the real text with a few words changed, so they score high, and quotes attached to the wrong source score low.

Two settings decide the fuzzy tier. The **threshold** is the score a passage needs to count as faithful. The **floor** is the score below which a passage is "unrelated" rather than altered.

**Why the threshold is 100.** A lower threshold would forgive near matches, but there is nothing to forgive: no faithful quote in quote marks ever reached the fuzzy tier. Meanwhile, the word-level edits sit at the top of the range, because one changed word in a long quote changes few characters. The sweep on quoted passages shows the cost of each step down:

| Threshold | Altered caught (of 23 quoted) | False alarms, answer key | False alarms, not in key |
|---|---|---|---|
| 90 | 8 | 0 | 17 |
| 95 | 16 | 0 | 17 |
| 98 | 20 | 0 | 18 |
| **100** | **21** | **0** | **18** |

At 95, all five word-level edits are missed. At 100, the only cost is one extra false alarm, and that one ("is just" for the source's "are just") is arguably a real misquote.

**Why the floor is 70.** At a threshold of 100 with no floor, 16 of the 18 false alarms on quoted passages are testimony or wrong-statute quotes, scoring 49.5–66.7. The lowest altered quote scores 79.2. Sweep on quoted passages, threshold 100:

| Floor | Altered caught (of 23 quoted) | False alarms, not in key |
|---|---|---|
| none | 21 | 18 |
| 60 | 21 | 3 |
| **70** | **21** | **2** |
| 80 | 20 | 2 |
| 85 | 18 | 1 |

Any floor from 70 to 75 gives the same result. At 80 the lowest altered quote is lost. The gap comes from a small sample (21 altered quotes in quote marks), so 70 is a starting point to re-check on new data, not a proven boundary.

**What the floor cannot fix.** The unquoted false alarms score 81–99, right among the altered quotes, because they are the same shape: a copied clause plus a few words. No score threshold can separate them. That is why unquoted flags are reported at lower confidence (see Results).

## Results

The checker is accurate. Most remaining error comes from finding the passages, and adding unquoted passages trades many false alarms for much higher recall. All figures use threshold 100 and floor 70.

Two configurations compared (positive class = altered):

| Metric | Quoted passages only | Quoted + unquoted |
|---|---|---|
| Altered quotes extracted | 23 / 40 | 38 / 40 |
| Faithful quotes extracted | 86 / 123 | 120 / 123 |
| Altered caught (TP) | 21 | 36 |
| Faithful flagged by mistake (FP, answer key) | 0 | 2 |
| **Altered recall, end to end** | 52.5% | **90.0%** |
| **Altered precision, answer-key quotes** | 100% | **94.7%** |
| **Altered F1, end to end** | 68.9% | **92.3%** |
| Flags on passages not in the answer key | 2 | 65 |
| Precision counting those flags as false alarms | 91.3% | 35.0% |

**Checker alone**, on what was extracted (quoted + unquoted): 36 of 38 altered quotes caught, 118 of 120 faithful quotes passed. Precision, recall and F1 are all 94.7%.

**By tier** (quoted + unquoted, answer-key passages that were extracted):

| Tier | Passages | Altered | Faithful |
|---|---|---|---|
| exact | 49 | 0 | 49 |
| normalized | 69 | 0 | 69 |
| fuzzy | 38 | 36 | 2 |
| no_source | 2 | 2 | 0 |

The tiers do almost all the work. No altered quote ever matched at the exact or normalized tier, and the only 2 faithful passages that fell to fuzzy were unquoted.

**The word-level edits.** The 5 alterations that are not the appended phrase are the best test of whether the checker generalizes. All 5 were caught, and all 5 were in quote marks:

| Document | Change | Fuzzy score |
|---|---|---|
| doc-0140 | shall → may | 99.0 |
| doc-0189 | primary → sole | 97.3 |
| doc-0076 | shall → may | 97.1 |
| doc-0014 | primary → sole | 95.6 |
| doc-0149 | not deleted | 95.6 |

**Quoted vs unquoted flags.** Flags on quoted passages are almost always right: 21 of 23. Flags on unquoted passages are right about 1 time in 4: 15 of 80 (15 correct, 2 faithful answer-key passages, 63 passages outside the key).

## Error analysis

Every remaining error has a known cause, and one of the four missed alterations is caught by the existence stage instead.

**Altered quotes missed (4 of 40):**

| Document | Why missed | Fixable here? |
|---|---|---|
| doc-0179 | Quote attached to AS 25.24.976(a), a fabricated citation planted in place of AS 25.24.170, so there is no source to compare | No. The existence stage flags the citation. |
| doc-0058 | Quote has no citation before it in its paragraph | Yes, by looking after the quote or in the previous paragraph |
| doc-0061 | Passage not extracted | Needs investigation |
| doc-0170 | Passage not extracted | Needs investigation |

**Faithful answer-key quotes flagged (2), both unquoted.** In each, a drafter copied the start of a statute clause and finished it in their own words:

- doc-0013: "...the parent's total income from all sources *minus certain enumerated deductions*" (score 82.1)
- doc-0057: "...the court shall consider *all relevant factors*" (score 84.8)

Structurally, these are identical to an appended alteration: the copy reaches a clause end, then a few new words follow.

**Flags on passages not in the answer key (65: 2 quoted, 63 unquoted).** They fall into three groups:

- **A drafter's own continuation** after a copied clause, the same pattern as above: "...against Petitioner", "...as a relevant factor", "...in that environment". These are most of the 65.
- **Real problems the answer key does not label as quote errors.** In doc-0016, a copied passage reads "the factors listed in AS 25.24.**908**". 908 is a planted fabricated citation, and the source says AS 25.24.160. In doc-0004, a copied passage changes the source's cross-reference from AS 25.20.060 to AS 25.24.150. Both are misstatements of the law.
- **Borderline quotes.** doc-0012 quotes "is just as between the spouses" where the source says "are just", a grammatical adjustment that would properly be bracketed: "[is] just". doc-0144 writes "through" where the source has a dash, as in "AS 18.66.100 — 18.66.180".

**Quotes the floor now excludes.** Before the floor existed, 16 more passages were flagged. All were testimony or passages attached to the wrong statute, scoring 49–67, for example "I will make sure you never see the kids again" attached to AS 18.66.100(c)(9).

**Faithful answer-key quotes never paired with a passage (3):** doc-0049, where the document cites the planted fabricated Alaska R. Evid. 930(a) in place of 706(a), and doc-0132 and doc-0135, both Civil Rule 65(e). None of these were flagged, so they do not hurt precision.

## Decisions and caveats

The results likely overstate performance on real-world alterations, because the benchmark's alterations are so uniform. Three design decisions shaped what the stage does and does not do.

**Benchmark caveat.** 35 of the 40 planted alterations are the same three words, "under all circumstances", appended to the end of a passage (see The data).

- A detector that searched for that phrase would score very well and catch nothing real. No rule in this stage looks for it or for any other specific wording. The rules are about structure: clean match or not, clause end, tail length.
- The 5 word-level edits are the real evidence of generalization. All 5 were caught, but all 5 were in quote marks.
- The unquoted append rule has only been tested on appended words, because those are 35 of the 40 alterations. It is untested on swaps, deletions or rewrites in unquoted text.

**Decision 1: threshold 100, not something like 95.** A lower threshold would forgive near matches. But no faithful quote in quote marks ever reached the fuzzy tier, so there was nothing to forgive, and the edits that matter most score highest: changing one word in a long quote changes few characters. At 95, all 5 word-level edits would have been missed.

**Decision 2: the semantic tier (sentence-transformers) was left out.** The plan listed it after fuzzy. It was not built, for two reasons:

- **Planted alterations barely move a sentence's embedding.** Swapping *shall* for *may*, or appending a qualifier, leaves the meaning-level vector of a passage almost unchanged. A semantic score would push these toward "faithful", the opposite of what is needed.
- **There is nothing for it to rescue.** Its job would be to accept faithful quotes that fuzzy matching rejects, and every faithful quote in quote marks already matches at the exact or normalized tier.

A language model could help with a different problem, the unquoted false alarms: telling a drafter's own continuation ("...as a relevant factor") from an inserted qualifier ("...under all circumstances"). That would be a classifier over the added words, not a similarity tier.

**Decision 3: swap detection for unquoted text was removed.** It caught 0 planted alterations and raised about 600 false alarms. Quoted text promises to be verbatim, so a changed word is an error. Unquoted text makes no such promise, so a changed word is usually paraphrase.

**Tuning stopped deliberately at 65 unquoted false alarms.** The next obvious step was lowering `MAX_TAIL` from 4 to 3, which would cut false alarms. It would also fit the rule to the three-word phrase this benchmark happens to use.

## Limitations and next steps

The biggest open problem is the unquoted false-alarm rate. The rest are smaller gaps with clear fixes.

| Limitation | Effect | Possible fix |
|---|---|---|
| Unquoted flags are right about 1 time in 4 | 63 false alarms on ordinary prose | Report them as "possible alteration, needs review"; later, a classifier over the added words |
| Quotes attach to the nearest citation before them, in the same paragraph | Testimony gets attached to statutes; doc-0058's alteration had no citation | Also search after the quote and in the previous paragraph, as the unquoted finder already does |
| Pinpoints are ignored | A quote cited to AS 25.24.150(c) is checked against all of section 150, so a quote from the wrong subsection still passes | Split statute text by subsection and match the pinpoint |
| The floor of 70 comes from 21 altered quotes | A heavily rewritten alteration scoring under 70 would be called "unrelated", not altered | Re-check the score gap on new or more varied data |
| Narrow benchmark alterations | Generalization is only shown for 5 quoted word edits | Test on alterations planted in other forms |
| Changed cross-references inside copied text (doc-0004, doc-0016) | Flagged only by accident, as a fuzzy mismatch | Make it a dedicated check: compare citations inside the passage with citations in the source |
| Case-law quotes | Not checked | Out of scope for this benchmark; would need case text in the corpus |

**Recommendation for the detector's output:**

1. Flags on quoted passages: report as altered quotes.
2. Flags on unquoted passages: report as "possible alteration: review the added words".
3. Any report of these numbers should carry the benchmark caveat.

## Reproducing

Everything runs from the repository root, on branch `carolyn/quote-fidelity`:

```bash
source .venv/bin/activate
pytest                                           # 80 tests
python scripts/evaluate_quotes.py                # quoted + unquoted; writes data/quote-fidelity-results.json
python scripts/evaluate_quotes.py --quoted-only  # baseline without unquoted passages
python scripts/sweep_threshold.py                # threshold and floor sweeps over the saved results
```

| File | Role |
|---|---|
| `src/citation_extractor/source_lookup.py` | Citation → source text |
| `src/citation_extractor/quote_extractor.py` | Quoted passages + their citations |
| `src/citation_extractor/unquoted_passages.py` | Passages copied without quote marks |
| `src/citation_extractor/quote_fidelity.py` | Tiered comparison, threshold and floor |
| `scripts/evaluate_quotes.py` | Pairing with the answer key and scoring |
| `scripts/sweep_threshold.py` | Threshold and floor sweeps |
| `data/quote-fidelity-results.json` | Every scored passage, the sweep's input |
| `reports/quote-fidelity-report.md` | The shorter milestone report in the repository |
| `tests/test_source_lookup.py`, `test_quote_extractor.py`, `test_quote_fidelity.py`, `test_unquoted_passages.py` | Unit tests |
