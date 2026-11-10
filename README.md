# EPSO Reasoning Trainer

Practice site for the EPSO verbal, numerical and abstract reasoning tests, with a visual, step-by-step guide to abstract reasoning rules.

- **Guide**: test formats, the isolate → track → predict → eliminate method, an interactive worked example and the nine abstract rule families.
- **Practice**: 24 abstract, 22 numerical and 32 verbal questions with explanations, 35 of them marked Hard (use the "Hard only" filter). Abstract explanations highlight the tracked element and cross out the options each rule eliminates.
- **Mock test**: timed runs in the EPSO format (verbal 20/35 min, numerical 10/20 min, abstract 10/10 min).
- **Italian abstract**: guide and 14 practice questions for figure-logic formats common in Italian hiring tests and concorsi (superimposition, 3×3 matrices, odd one out, analogies). EPSO does not use these formats.
- **Italian for my beautiful girlfriend**: the EPSO practice in Italian. Verbal (20) and numerical (12) questions are written directly in Italian on Italian and EU topics; the abstract figures are shared with the English section, with Italian explanations. Includes an Italian guide and timed mock tests.

All questions are original practice material. Answers are checked by `node tools/verify.js`, which re-derives every abstract frame from its rules, recomputes every numerical answer from the data (English and Italian), confirms each verbal question has exactly one true statement, and checks that each Italian-style figure question has exactly one answer that no alternative rule could also justify.

No build step: `index.html`, `data.js` and `app.js` are served as-is by GitHub Pages.
