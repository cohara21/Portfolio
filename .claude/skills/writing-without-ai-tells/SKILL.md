---
name: writing-without-ai-tells
description: Use when writing or editing prose that must not read as machine-generated, including case studies, portfolio copy, landing pages, emails, posts, docs, and bios. Also use immediately after any rule-based editing pass, and when a reader says text "sounds like AI" without being able to say why.
---

# Writing without AI tells

## Overview

AI-sounding prose is not caused by bad vocabulary alone. It comes from three
separate layers, and most tools only check one:

1. **Vocabulary.** Specific overused words. Easy to grep, easy to fix.
2. **Syntax.** Constructions models reach for: dodging "is", cycling synonyms,
   negative parallelism. Invisible to a word list.
3. **Rhythm.** Sentence lengths that never vary, runs of short declaratives.
   The layer readers feel first and name last.

Fix all three or the text still reads wrong.

## Before you start: three calibrations

Do these first. Skipping them is how rule-following produces worse writing.

### 1. Medium

The same mark is correct in one medium and a tell in another. Check the target
before applying any punctuation or formatting rule.

| Rule | Plain text (email, DM, code, chat) | Typeset page (website, PDF, print) |
|---|---|---|
| Curly quotes `“ ”` | Tell. Use straight quotes. | **Correct typography. Leave them.** |
| Markdown headers | Tell. Remove. | Fine, they render. |
| Bold for emphasis | Tell. Let words work. | Fine in moderation. See rule 12. |
| Emoji bullets | Tell in both. | Tell in both. |

### 2. Voice

If the writer has samples, match them. A stated preference outranks every
threshold in this document. If the writer never uses semicolons, do not add
semicolons to hit a target. If the writer does use em dashes heavily and it
reads as theirs, keep them.

Ask: what would this person never say?

### 3. Stakes

Hedging is a tell in an opinion piece and correct in a safety notice. Do not
strip qualifiers from text where the uncertainty is real.

## Tier 1: hard constraints

These are near-absolute. Violations are almost always a tell.

**1. No em dashes or en dashes.** `—` and `–`, plus spaced ` - ` and ` -- `
when they are doing a dash's job: an aside, an interruption, or a lead-in to
an elaboration. Scan the finished text; any hit means it is not done. Replace
with, in order of preference: a period, a comma, a colon, parentheses, or a
restructure. *Override: a writer's own samples that use them.*

Not covered by this rule: hyphens in ranges (`Jan 2026 - March 2026`),
compounds (`role-based`), or minus signs. Fix those on typography grounds if
you want, but they are not a tell.

**2. No banned vocabulary.** See `references/banned-vocabulary.md`. If you are
reaching for one, the sentence usually wants a concrete noun instead.

**3. No three consecutive sentences of similar length.** The most measurable
signal there is. Count words per sentence; if three in a row sit within about
two words of each other, break the run. Count **within a paragraph**. Sentences
either side of a paragraph break are not consecutive, and treating them as such
produces false hits.

**4. No runs of three or more short declaratives.** Both parataxis ("Short
sentence. Then another. Then another.") and manufactured drama, where every
line lands like a closer. One short sentence for emphasis is fine. A stack of
them is engineered.

> Before: Then AlphaEvolve arrived. It had no preference for symmetry. No
> aesthetic prior. The old rules were gone.
> After: AlphaEvolve changed the search because it did not favour symmetry or
> human-looking designs, which made some older assumptions less useful.

**5. No copula avoidance.** Watch for *serves as, stands as, marks a,
represents a, boasts, features a, offers a*. Models substitute these for plain
"is" and "has".

> Before: The hardware serves as a gentle home companion.
> After: The hardware is a gentle home companion.

**6. No negative parallelism or tailing negations.** "Not only X but Y",
"it's not just X, it's Y", and clipped fragments like "no guessing" tacked
onto a sentence end.

**7. No signposting.** "Let's dive in", "here's what you need to know", "let's
break this down". Do the thing instead of announcing it.

**8. No aphorism formulas.** "X is the language of Y", "the architecture of
Z", "X becomes a trap". These sound profound and say less than the plain claim
underneath.

**9. No fabricated specifics.** Never invent a number, study, quote, or
anecdote. Honest vagueness beats fake precision. If the real number is
missing, say "roughly" or say you do not have it.

## Tier 2: judgment calls

These fire often on good writing. Look at every hit; expect to keep some.

**10. Rule of three.** Real threes exist. Break the ones that are padding.

**11. Elegant variation.** Cycling synonyms for the same thing (protagonist,
main character, central figure, hero) reads as a thesaurus running. Repeat the
noun.

**12. Boldface density.** A bold lead-in sentence followed by explanation is a
legitimate scanning aid. Repeated more than about five times in one document
it becomes a template. Count them.

**13. Passive voice.** Prefer active. Keep passive when the actor genuinely
does not matter.

**14. "From X to Y".** A tell only when X and Y are not on a real scale. "From
polyp to reef" is a genuine progression. "From the Big Bang to dark matter" is
decoration.

**15. Hyphenated pairs.** Keep attributive hyphens (*a high-quality report*).
Drop them in predicate position (*the report is high quality*).

**16. Title case in headings.** Prefer sentence case, but proper nouns and
short labels like "Overview" are not violations.

## Verify after editing, not just before

Fixes create new tells. This is the most-missed step.

Removing an em dash splits a sentence, which can create a run of short
declaratives (rule 4). Removing a banned word can leave a synonym cycle
(rule 11). Shortening a hedge can flip a genuine uncertainty into a false
claim (rule 9).

After any pass, re-check rules 1, 3, and 4 on the edited text.

## What this cannot catch

Rules detect machine-ness. They say nothing about whether the writing is any
good. Prose can satisfy every line above and still be dull, unconvincing, or
wrong.

None of these rules will find:

- A claim in one paragraph that contradicts a claim in another
- A conclusion given away before the section that was supposed to deliver it
- Four different numbers describing the same thing
- A section that repeats what the previous section already said
- Whether the argument actually holds

Those need a reading, not a scan. Do the reading.

## Quick reference

| Layer | Check | Where |
|---|---|---|
| Punctuation | em/en dashes, curly quotes by medium | Tier 1.1, calibration |
| Vocabulary | banned list | `references/banned-vocabulary.md` |
| Syntax | copula, negative parallelism, aphorism, signposting | Tier 1.5-1.8 |
| Rhythm | length uniformity, short-declarative runs | Tier 1.3-1.4 |
| Density | boldface, rule of three, synonym cycling | Tier 2 |
| Truth | fabricated specifics | Tier 1.9 |
| Substance | contradictions, spoilers, repetition | Read it |

## Common mistakes

| Mistake | Fix |
|---|---|
| Applying the curly-quote rule to a website | Check medium first. Curly quotes are correct typography there. |
| Chasing a numeric quota into worse sentences | Thresholds are diagnostics, not targets. |
| Treating every Tier 2 hit as a defect | Expect false positives. Read each one. |
| Scanning clean and shipping | Rules miss contradictions and repetition entirely. |
| Stripping a writer's real habit | Voice outranks every rule here. |
| Editing once and not re-scanning | Fixes create new tells. Re-check rhythm. |
