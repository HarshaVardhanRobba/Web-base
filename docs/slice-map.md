# Slice Map - Day 1 Level 1 Change

Entry point: README.md, Layout section, the tree listing under app/, components/, workflows/.

File touched: README.md - added one line for docs, in the main repo

Not touched: no source file, no config, no dependency; app build and runtime unchanged.
Level 2 neighbor: pick another entry in the same Layout tree with narrow single-file scope, such as workflows/nodes/settings.ts (node registry) etc.
How to find it: open README Layout block, scan for a real source path near the touched line, confirm it does one job before treating it as a Level 2 candidate.
