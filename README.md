SPARQL Environment
==================

A javascript based integrated query environment developed to improve on the default SPARQL query box and make it easier to query any SPARQL database.

Built using javascript and jQuery this IQE allows for the querying of SPARQL databases without knowledge of the underlying content. This framework can be used to create very simple text-based database interactions as well as data specific interactions using graphical user interfaces designed for end users.

## Setup and Installation

The SPARQL Environment runs in a browser client-side. To get up and running simply clone this repository and open the index.html file in your browser. 

*Note: Some browsers restrict access to local files due to the security risk that imposes. Don't worry creating a localhost end point can solve this problem. In your command line prompt navigate to the repository and enter:*

`python -m SimpleHTTPServer`

## Configs

The config files contain the nessesary information to start querying a dataset. 

- Name & Description: These fields identify the dataset and should explain something about the data.
- Source: URL for the SPARQL Node. 
- Prefixes: Define your prefixes to make querying much easier.
- Variables: Define common variables used with your database to make queries make more sense. (In-Development)
- Plugins: List the plugins this dataset will display.

Plugin specific config variables should also be set. Consult the markdown files for those plugins for which values need to be set.

## Basic Usability

The Environment is layed out to be extremely flexible. When completly uncollapsed the environment displays a left side bar, a middle workspace and a right side bar.

#### Data Sets

The left side bar lists all your datasets. To import new datasets click the down arrow icon and use whichever method (URL or File) you wish to select a config file. The config file will setup the dataset information. You can also perform simple edits on datasets by clicking edit next to the setlist name.

#### Workspace

The workspace is the center to panels of your screen. This area is subdivided into two sections Input and Output.

##### Input

The input section contains all of the current dataset's input plugins. The objective of the section is to produce a query. When a query is made the environemnt performs the query and passes on the results to the output plugins.

##### Output

The output section contains all of the current dataset's output plugins. The objective of the section is to display query results. When query results come in the output plugins get updated and can update themselves with new information.

#### Details

The right side bar contains the details panel. This bar is currently being figured out. (In-Development)

## Plugins

Plugins for SPARQL Environment are called SparqPlugs. Clever, we know. This gives us a namespace from which to operate. File which being with *"sparqplug."* depict plugins for the SPARQL Environment. We hope this allows developers to create and share sparqplugs more effeciently. However so we can sound like normal people we will discribe the as plugins within the context of the SPARQL Environment. 

Plugins are either agnostic (data independent) or specific (data dependent) and should be labeled clearly which they are. Examples of agnostic plugins are the "Text Query Editor" which is a sophisticated query editor and the "JSON Viewer". Both of these plugins will work with any dataset thier given.

There are two types of Plugins input and output.

#### Input

The goal of an input plugin is to take user input and create a SPARQL query.  

#### Output

The goal of the output plugin is to present the user with the results of the SPARQL query.

## Contribute

Create configs for your datasets, create specific plugins for your data and let us know if you're interested in advancing the underlying framework!