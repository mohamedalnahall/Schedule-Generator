# Schedule-Generator
Arabic Language : [![ar](https://img.shields.io/badge/lang-arabic-red.svg)](https://github.com/mohamedalnahall/Schedule-Generator/blob/master/README.md)

Schedule Generator is open-source tool that can help creating schedules by generating possible schedules based on your preference

### Notes
  - The generated schedules using Genetic Method are not always the best possible schedules.
  - Too restrictive preference may lead to undesirable results.

# How Full Scan Method works
All possible schedules are generated and then the best performing schedule is selected based on user preferences

# How Genetic Method works
The process begins by generating a large number of random schedules. Using a Weighted Random method, pairs of schedules are selected based on their quality or fitness. This means schedules that have no conflicts and are closer to the user preference are more likely to be chosen.

From each selected pair, a new generation of schedules is created by combining the parent schedules. This generation is then subject to small modifications or mutations to introduce diversity and explore different possibilities.

This entire process is iterated multiple times, each iteration is referred to as a generation. The selection, combination, and mutation steps help refine the schedules with each successive generation. Through this iterative evolution, the schedules gradually improve in quality, converging towards better schedules.

After a predefined number of iterations, the best-performing schedules from the final generation is selected. This schedules are the output of the process and represents a solution that has been refined through multiple generations of selection, combination, and mutation.
