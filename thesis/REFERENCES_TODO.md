# Reference completion worklist

13 of 75 entries in `references.js` carry placeholders. Everything else about
each one is already correct: journal, volume, issue and pages came from the
executed search log, so a Scopus record page gives you what is missing in a few
seconds per entry.

I did not attempt these from a web search. General search returns journal front
pages rather than bibliographic records, and the failure mode is a plausible
title I cannot verify. A visible placeholder is honest; a wrong reference in a
doctorate is not.

Edit `thesis/references.js` in place. Keep the APA form of the entries around them.

| # | First author | Year | What is missing | Where to find it |
|---|---|---|---|---|
| 1 | Căpățînă | 2024 | exact title from export | Journal of Innovation & Knowledge, 9(3), 100530. |
| 2 | Cromley | 2025 | exact title from export, initials | Educational Psychology Review. |
| 3 | D’Ignazio | 2026 | co-authors from export | Tackling the gender gap in financial literacy: Evidence from a financi |
| 4 | Knowles | 2025 | initials | The adult learner: The definitive classic in adult education and human |
| 5 | Kulkarni | 2022 | co-authors from export | An empirical study on the impact of learning theory on gamification-ba |
| 6 | Kumar | 2024 | exact title from export | Online Learning, 28(3), 207–231. |
| 7 | Muljana | 2024 | co-authors from export, exact title from export | Educational Technology Research and Development, 72, 2413–2437. |
| 8 | Noetel | 2022 | remaining authors from export | Multimedia design for learning: An overview of reviews with meta-meta- |
| 9 | Ponce | 2024 | exact title from export, initials | International Journal of Human–Computer Interaction, 40(11), 2954–2967 |
| 10 | Rodrigues | 2016 | exact title from export | Computers in Human Behavior, 62, 620–634. |
| 11 | Soobhany | 2026 | co-authors from export | Finance Masters: Game-based financial learning for SME managers. Lectu |
| 12 | Yan | 2024 | remaining authors from export | Practical and ethical challenges of large language models in education |
| 13 | Zeng | 2024 | authors from export, exact title from export | British Journal of Educational Technology, 55(5), 1919–1943. |

## After editing

```bash
cd thesis
node build-skeleton.js TP_Working_Draft_Sadeq.docx && node stamp-cover.js TP_Working_Draft_Sadeq.docx
```

The build prints the word count and fails loudly if the body leaves the 8,000 to
11,000 band. Completing references changes the reference count, not the body, so
it should move the cover figure and nothing else.

## Also outstanding on the cover

`[ID NUMBER]` is the only placeholder left outside the reference list. It is in
`build-skeleton.js`, in the cover block. The date now fills itself.
