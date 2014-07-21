# SparqPlugs

*Plugins for the SPARQL Environment to either aid in the writing of SPARQL Queries or the presentation of the results.*

## Input

Responsibilities of an input SparqPlug are:

- Take user input.
- Create a SPARQL Query object.
- Take a SPARQL Query and update the UI without changing the original query.

`sparqplug.in.*.load`



## Output

Responsibilities of an output SparqPlug are:

- Take query results.
- Display results.

## Naming Conventions

As with other frameworks names are on a first come first serve bases and the internet is the only regulatory device. The convention for naming the files is sparqplug.in.\*.{js,css} or sparqplug.out.\*.{js,css}.

If you are creating a suite of plugins for a specific dataset please use a second namespace. For Example the Homer Multi-Text uses sparqplug.in.**hmt**.\*.{js,css} for their suite of specific plugins.

