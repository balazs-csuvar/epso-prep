# EPSO Reasoning Trainer

Practice site for the EPSO verbal, numerical and abstract reasoning tests, with a visual, step-by-step guide to abstract reasoning rules.

- **Guide**: test formats, the isolate → track → predict → eliminate method, an interactive worked example and the nine abstract rule families.
- **Practice**: 24 abstract, 22 numerical and 32 verbal questions with explanations, 35 of them marked Hard (use the "Hard only" filter). Abstract explanations highlight the tracked element and cross out the options each rule eliminates.
- **Mock test**: timed runs in the EPSO format (verbal 20/35 min, numerical 10/20 min, abstract 10/10 min).

All questions are original practice material. Answers are checked by `node tools/verify.js`, which re-derives every abstract frame from its rules, recomputes every numerical answer from the data, and confirms each verbal question has exactly one true statement.

No build step: `index.html`, `data.js` and `app.js` are served as-is by GitHub Pages.
