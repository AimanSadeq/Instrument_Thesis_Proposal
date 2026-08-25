# The doctoral deliverables

Three documents go to SDA Bocconi, and all three are built from source rather
than edited by hand. That is the point of this directory: the proposal, the
protocol and the instruments cannot drift apart, because the words in each come
from one place.

| Document | Built from | Command |
|---|---|---|
| Thesis Proposal | `build-skeleton.js` + `section*.js` + `appendices-a-d.js` + `references.js` | `node build-skeleton.js TP_Working_Draft_Sadeq.docx && node stamp-cover.js TP_Working_Draft_Sadeq.docx` |
| Research Protocol and DMP | `../docs/source/Research_Protocol_DMP_v*.md` | `node build-protocol-source.js` |
| Research Instruments | `../docs/source/Research_Instruments_v*.md` | `node build-instruments-source.js` |

`npm install` first. The only dependency is `docx`.

## Why the .docx files are not committed

Every one of them is regenerable in seconds from the sources beside it, and the
proposal is rebuilt many times a day. Committing them would mean a repository
full of near-identical binaries and a reader who cannot tell which is current.
The sources are the record; `.gitignore` keeps the outputs out.

`cover.doc` is the exception and is committed. It is the Blackboard cover
template supplied by the School, so it is an input, not an output.

## Naming, which is not optional

Two standing rules, both enforced by the scripts rather than by memory:

- **The proposal carries its build number in the file name.** `stamp-cover.js`
  renames its output to `TP_Working_Draft_Sadeq_build{N}.docx`, matching the
  stamp on the cover page. Two different documents must never share a name;
  that is how a corrupt build and its repair both came to be called "build 14".
- **The protocol and the instruments carry their version in the file name**, and
  the version is read from the source file name rather than typed anywhere, so
  the document, the file and the change log cannot disagree.

## The one thing that must never enter this directory

No participant response, ever. Not an instrument return, not an interview
transcript, not a quotation with a name attached. Protocol section 7 forbids
participant data reaching any generative AI system, and this repository is
worked on with one. Analysis material lives in the encrypted store named in the
data management plan, not here.

Business correspondence is a different matter and the email drafts here are
fine, but the moment a client contact becomes an interview participant, their
name stops being business correspondence.

## What else is here

`guidelines.pdf` and `requirements-brief.md` are the DBA programme rules the
proposal is written against, section 3.2 for structure and 3.4 for formatting.
`style-profile.md` records the candidate's writing voice. `scopus-log*` holds
the executed search protocol behind Section 2.8 and Appendix J. `year1-lr*` is
the Year 1 literature review the proposal builds on.
