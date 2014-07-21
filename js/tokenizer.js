// ####################################################################
// #   _   _       _                _                        _        #
// #  | \ | | ___ | |_   _   _  ___| |_   _ __ ___  __ _  __| |_   _  #
// #  |  \| |/ _ \| __| | | | |/ _ \ __| | '__/ _ \/ _` |/ _` | | | | #
// #  | |\  | (_) | |_  | |_| |  __/ |_  | | |  __/ (_| | (_| | |_| | #
// #  |_| \_|\___/ \__|  \__, |\___|\__| |_|  \___|\__,_|\__,_|\__, | #
// #                     |___/                                 |___/  #
// ####################################################################

var tokenizer = {};
tokenizer.reservedWords = ["SELECT","WHERE","GROUP"];

tokenizer.tokenize = function () {
	this.variables = [];
	this.tokens = this.queryString.split(' ');
	this.currentTokenIndex = 0;
	if (!this.matchQueryUnit()) {
		this.error('Error with Match Query');
	}
	this.inform('Variables found: ' + this.variables);
}

tokenizer.nextToken = function () {
	this.currentTokenIndex++;
	var token = this.tokens[this.currentTokenIndex];
	this.inform('nextToken: '+token+' ['+this.currentTokenIndex+']');
	return token;
}

tokenizer.currentToken = function () {
	var token = this.tokens[this.currentTokenIndex];
	this.inform('currentToken: '+token+' ['+this.currentTokenIndex+']');
	return token;
}

tokenizer.error = function(message) {
	console.log('TOK ERR: '+message);
}

tokenizer.inform = function(message) {
	console.log('TOK INF: '+message);
}

// #################################################################################################
// #                                                                                               #
// #                            SPARQL BNF methods for token parsing                               #
// #                                                                                               #
// #################################################################################################

// QueryUnit ::= Query
tokenizer.matchQueryUnit = function () {
	this.matchQuery();
}

// Query ::= Prologue ( SelectQuery | ConstructQuery | DescribeQuery | AskQuery ) ValuesClause
// TO-DO: add ConstructQuery, DescribeQuery, and AskQuery
// TO-DO: add ValuesClause
tokenizer.matchQuery = function () {
	if (this.matchPrologue()) {
		this.inform('Match Prologue'); // Prologue can be empty
	}
	if (!this.matchSelectQuery()) {
		this.error('No SELECT Query');
		return false;
	}
}

// UpdateUnit ::= Update
tokenizer.matchUpdateUnit = function () {
	this.matchUpdate();
}

// Prologue ::= ( BaseDecl | PrefixDecl )*
tokenizer.matchPrologue = function () {
	var checking = true;
	while (checking) {
		if (this.matchBaseDecl()) {
			this.inform('Match BASE');
			token = this.nextToken();
		}
		if (this.matchPrefixDecl()) {
			this.inform('Match PREFIX');
			token = this.nextToken();
		}
		else {
			checking = false;
		}
	}
	return true;
}

// BaseDecl ::= 'BASE' IRIREF
tokenizer.matchBaseDecl = function () {
	var token = this.currentToken();
	if (token == 'BASE') {
		token = this.nextToken();
		if (!this.matchIRIREF()) {
			this.error('BASE incorrectly formatted (IRIREF)');
		}
		return true;
	}
	return false;
}

// PrefixDecl ::= 'PREFIX' PNAME_NS IRIREF
tokenizer.matchPrefixDecl = function () {
	var token = this.currentToken();
	if (token == 'PREFIX') {
		token = this.nextToken();
		if (this.matchPNAME_NS()) {
			token = this.nextToken();
		}
		else { 
			this.error('PREFIX incorrectly formatted (PNAME_NS)');
		}
		if (!this.matchIRIREF()) {
			this.error('PREFIX incorrectly formatted (IRIREF)');
		}
		return true;
	}
	return false;
}

// SelectQuery ::= SelectClause DatasetClause* WhereClause SolutionModifier
// TO-DO: add DatasetClause and SolutionModifier
tokenizer.matchSelectQuery = function () {
	if (this.matchSelectClause()) {
		this.inform('Match SelectClause');
		//this.nextToken();
		if (this.matchWhereClause()) {
			this.inform('Match WhereClause');
			this.nextToken();
		}
		return true;
	}
	return false;
}

// SubSelect ::= SelectClause WhereClause SolutionModifier ValuesClause
// TO-DO: add SolutionModifier and ValuesClause
tokenizer.matchSubSelect = function () {
	if (this.matchSelectClause()) {
		this.inform('Match SelectClause');
		//this.nextToken();
		if (this.matchWhereClause()) {
			this.inform('Match WhereClause');
			this.nextToken();
		}
		return true;
	}
	return false;
}

// 'SELECT' ( 'DISTINCT' | 'REDUCED' )? ( ( Var | ( '(' Expression 'AS' Var ')' ) )+ | '*' )
tokenizer.matchSelectClause = function () {
	var token = this.currentToken();
	if (token == 'SELECT') {
		this.inform('In SELECT Clause');
		token = this.nextToken();
		if (token == 'DISTINCT' || token == 'REDUCED') {
			token = this.nextToken();
		}
		if (token == '*') {
			return true;
		}
		var checkingVariablesAndExpessions = true;
		while (checkingVariablesAndExpessions) {
			if (this.matchVar()) {
				token = this.nextToken();
			}
			else if (token == '(') {
				token = this.nextToken();
				if (!this.matchExpression()) {
					this.error('No Expression in SelectClause (expression as variable)');
					return;
				}
				token = this.nextToken();
				if (token != 'AS') {
					this.error('No AS in SelectClause (expression as variable)');
					return;
				}
				token = this.nextToken();
				if (!this.matchVar(token)) {
					this.error('No Var in SelectClause (expression as variable)');
					return;
				}
				token = this.nextToken();
				if (token != ')') {
					this.error('No Closing ) in SelectClause (expression as variable)');
					return;
				}
				token = this.nextToken();
			}
			else {
				checkingVariablesAndExpessions = false;
			}
		}
		return true;
	}
	return false;
}

// ConstructQuery ::= 'CONSTRUCT' ( ConstructTemplate DatasetClause* WhereClause SolutionModifier | DatasetClause* 'WHERE' '{' TriplesTemplate? '}' SolutionModifier )
tokenizer.matchConstructQuery = function () {
	//TO-DO
}

// DescribeQuery ::= 'DESCRIBE' ( VarOrIri+ | '*' ) DatasetClause* WhereClause? SolutionModifier
tokenizer.matchDescribeQuery = function () {
	//TO-DO
}

// AskQuery ::= 'ASK' DatasetClause* WhereClause SolutionModifier
tokenizer.matchAskQuery = function () {
	//TO-DO
}

// DatasetClause ::= 'FROM' ( DefaultGraphClause | NamedGraphClause )
tokenizer.matchDatasetClause = function () {
	//TO-DO
}

// DefaultGraphClause ::= SourceSelector
tokenizer.matchDefaultGraphClause = function () {
	this.matchSourceSelector();
}

// NamedGraphClause ::= 'NAMED' SourceSelector
tokenizer.matchNamedGraphClause = function () {
	//TO-DO
}

// SourceSelector ::= iri
tokenizer.matchSourceSelector = function () {
	this.matchiri();
}

// WhereClause ::= 'WHERE'? GroupGraphPattern
tokenizer.matchWhereClause = function () {
	var token = this.currentToken();
	if (token == 'WHERE') {
		this.inform('In Where Clause');
		this.nextToken()
		if (!this.matchGroupGraphPattern()) {
			this.error('No GroupGraphPattern in WhereClause');
		}
		return true;
	}
	return false;
}

// SolutionModifier ::= GroupClause? HavingClause? OrderClause? LimitOffsetClauses?
tokenizer.matchSolutionModifier = function () {
	//TO-DO
}

// GroupClause ::= 'GROUP' 'BY' GroupCondition+
tokenizer.matchGroupClause = function () {
	//TO-DO
}

// GroupCondition ::= BuiltInCall | FunctionCall | '(' Expression ( 'AS' Var )? ')' | Var
tokenizer.matchGroupCondition = function () {
	//TO-DO
}

// HavingClause ::= 'HAVING' HavingCondition+
tokenizer.matchHavingClause = function () {
	//TO-DO
}

// HavingCondition ::= Constraint
tokenizer.matchHavingCondition = function () {
	this.matchConstraint();
}

// OrderClause ::= 'ORDER' 'BY' OrderCondition+
tokenizer.matchOrderClause = function () {
	//TO-DO
}

// OrderCondition ::= ( ( 'ASC' | 'DESC' ) BrackettedExpression ) | ( Constraint | Var )
tokenizer.matchOrderCondition = function () {
	//TO-DO
}

// LimitOffsetClauses ::= LimitClause OffsetClause? | OffsetClause LimitClause?
tokenizer.matchLimitOffsetClauses = function () {
	//TO-DO
}

// LimitClause ::= 'LIMIT' INTEGER
tokenizer.matchLimitClause = function () {
	//TO-DO
}

// OffsetClause ::= 'OFFSET' INTEGER
tokenizer.matchOffsetClause = function () {
	//TO-DO
}

//ValuesClause ::= ( 'VALUES' DataBlock )?
tokenizer.matchValuesClause = function () {
	//TO-DO
}

// Update ::= Prologue ( Update1 ( ';' Update )? )?
tokenizer.matchUpdate = function () {
	//TO-DO
}

// Update1 ::= Load | Clear | Drop | Add | Move | Copy | Create | InsertData | DeleteData | DeleteWhere | Modify
tokenizer.matchUpdate1 = function () {
	//TO-DO
}

// Load ::= 'LOAD' 'SILENT'? iri ( 'INTO' GraphRef )?
tokenizer.matchLoad = function () {
	//TO-DO
}

// Clear ::= 'CLEAR' 'SILENT'? GraphRefAll
tokenizer.matchClear = function () {
	//TO-DO
}

// Drop ::= 'DROP' 'SILENT'? GraphRefAll
tokenizer.matchDrop = function () {
	//TO-DO
}

// Create ::= 'CREATE' 'SILENT'? GraphRef
tokenizer.matchCreate = function () {
	//TO-DO
}

// Add ::= 'ADD' 'SILENT'? GraphOrDefault 'TO' GraphOrDefault
tokenizer.matchAdd = function () {
	//TO-DO
}

// Move ::= 'MOVE' 'SILENT'? GraphOrDefault 'TO' GraphOrDefault
tokenizer.matchMove = function () {
	//TO-DO
}

// Copy ::= 'COPY' 'SILENT'? GraphOrDefault 'TO' GraphOrDefault
tokenizer.matchCopy = function () {
	//TO-DO
}

// InsertData ::= 'INSERT DATA' QuadData
tokenizer.matchInsertData = function () {
	//TO-DO
}

// DeleteData ::= 'DELETE DATA' QuadData
tokenizer.matchDeleteData = function () {
	//TO-DO
}

// DeleteWhere ::= 'DELETE WHERE' QuadPattern
tokenizer.matchDeleteWhere = function () {
	//TO-DO
}

// Modify ::= ( 'WITH' iri )? ( DeleteClause InsertClause? | InsertClause ) UsingClause* 'WHERE' GroupGraphPattern
tokenizer.matchModify = function () {
	//TO-DO
}

// DeleteClause ::= 'DELETE' QuadPattern
tokenizer.matchDeleteClause = function () {
	//TO-DO
}

// InsertClause ::= 'INSERT' QuadPattern
tokenizer.matchInsertClause = function () {
	//TO-DO
}

// UsingClause ::= 'USING' ( iri | 'NAMED' iri )
tokenizer.matchUsingClause = function () {
	//TO-DO
}

// GraphOrDefault ::= 'DEFAULT' | 'GRAPH'? iri
tokenizer.matchGraphOrDefault = function () {
	//TO-DO
}

// GraphRef ::= 'GRAPH' iri
tokenizer.matchGraphRef = function () {
	//TO-DO
}

// GraphRefAll ::= GraphRef | 'DEFAULT' | 'NAMED' | 'ALL'
tokenizer.matchGraphRefAll = function () {
	//TO-DO
}

// QuadPattern ::= '{' Quads '}'
tokenizer.matchQuadPattern = function () {
	//TO-DO
}

// QuadData ::= '{' Quads '}'
tokenizer.matchQuadData = function () {
	//TO-DO
}

// Quads ::= TriplesTemplate? ( QuadsNotTriples '.'? TriplesTemplate? )*
tokenizer.matchQuads = function () {
	//TO-DO
}

// QuadsNotTriples ::= 'GRAPH' VarOrIri '{' TriplesTemplate? '}'
tokenizer.matchQuadsNotTriples = function () {
	//TO-DO
}

// TriplesTemplate ::= TriplesSameSubject ( '.' TriplesTemplate? )?
tokenizer.matchTriplesTemplate = function () {
	//TO-DO
}

// GroupGraphPattern ::= '{' ( SubSelect | GroupGraphPatternSub ) '}'
tokenizer.matchGroupGraphPattern = function () {
	var token = this.currentToken();
	if (token == '{') {
		this.nextToken();
		if (this.matchSubSelect() || this.matchGroupGraphPatternSub()) {
			token = this.nextToken();
			if (token != '}') {
				this.error('No closing bracket in GroupGraphPattern');
			}
		}
		else {
			this.error('No SubSelect or GroupGraphPatternSub in GroupGraphPattern');
		}
		return true;
	}
	return false;
}

// GroupGraphPatternSub ::= TriplesBlock? ( GraphPatternNotTriples '.'? TriplesBlock? )*
tokenizer.matchGroupGraphPatternSub = function () {
	if (this.matchTriplesBlock()) {
		this.nextToken();
	}
	while (this.matchGraphPatternNotTriples()) {
		var token = this.nextToken();
		if (token == '.') {
			this.nextToken();
			if (this.matchTriplesBlock) {
				this.nextToken();
			}
		}
	}
	this.inform('Match GroupGraphPatternSub');
	return true;
}

// TriplesBlock ::= TriplesSameSubjectPath ( '.' TriplesBlock? )?
tokenizer.matchTriplesBlock = function () {
	if (this.matchTriplesSameSubjectPath()) {
		var token = this.nextToken();
		if (token == '.') {
			this.nextToken();
			this.matchTriplesBlock();
		}
		this.inform('Match TriplesBlock');
		return true;
	}
	return false;
}

// GraphPatternNotTriples ::= GroupOrUnionGraphPattern | OptionalGraphPattern | MinusGraphPattern | GraphGraphPattern | ServiceGraphPattern | Filter | Bind | InlineData
tokenizer.matchGraphPatternNotTriples = function () {
	if (this.matchGroupOrUnionGraphPattern() || this.matchOptionalGraphPattern() || this.matchMinusGraphPattern() || this.matchGraphGraphPattern() || this.matchServiceGraphPattern() || this.matchFilter() || this.matchBind() || this.matchInlineData()) {
		this.inform('Match GraphPatternNotTriples');
		return true;
	}
	return false;
}

// OptionalGraphPattern ::= 'OPTIONAL' GroupGraphPattern
tokenizer.matchOptionalGraphPattern = function () {
	var token = this.currentToken();
	if (token == 'OPTIONAL') {
		this.nextToken();
		if (!this.matchGroupGraphPattern()) {
			this.error('No GroupGraphPattern after OPTIONAL');
		}
		this.inform('Match OptionalGraphPattern');
		return true;
	}
	return false;
}

// GraphGraphPattern ::= 'GRAPH' VarOrIri GroupGraphPattern
tokenizer.matchGraphGraphPattern = function () {
	var token = this.currentToken();
	if (token == 'GRAPH') {
		this.nextToken();
		if (this.matchVarOrIri()) {
			this.nextToken();
			if (!this.matchGroupGraphPattern()) {
				this.error('No GroupGraphPattern after VarOrIri');
			}
		}
		else this.error('No VarOrIri after GRAPH');
		this.inform('Match GraphGraphPattern');
		return true;
	}
	return false;
}

// ServiceGraphPattern ::= 'SERVICE' 'SILENT'? VarOrIri GroupGraphPattern
tokenizer.matchServiceGraphPattern = function () {
	var token = this.currentToken();
	if (token == 'SERVICE') {
		token = this.nextToken();
		if (token == 'SILENT') {
			this.nextToken();
		}
		if (this.matchVarOrIri()) {
			this.nextToken()
			if (!this.matchGroupGraphPattern()) {
				this.error('No GroupGraphPattern after VarOrIri');
			}
		}
		else this.error('No VarOrIri after GRAPH (SILENT)?');
		this.inform('Match ServiceGraphPattern');
		return true;
	}
	return false;
}

// Bind ::= 'BIND' '(' Expression 'AS' Var ')'
tokenizer.matchBind = function () {
	var token = this.currentToken();
	if (token == 'BIND') {
		token = this.nextToken();
		if (token == '(') {
			token = this.nextToken();
			if (!this.matchExpression()) {
				this.error('No Expression in Bind (expression as variable)');
				return;
			}
			token = this.nextToken();
			if (token != 'AS') {
				this.error('No AS in Bind (expression as variable)');
				return;
			}
			token = this.nextToken();
			if (!this.matchVar(token)) {
				this.error('No Var in Bind (expression as variable)');
				return;
			}
			token = this.nextToken();
			if (token != ')') {
				this.error('No Closing ) in Bind (expression as variable)');
				return;
			}
			token = this.nextToken();
		}
		else this.error('No (expression as variable) after BIND');
		this.inform('Match Bind');
		return true;
	}
	return false;
}

// InlineData ::= 'VALUES' DataBlock
tokenizer.matchInlineData = function () {
	var token = this.currentToken();
	if (token == 'VALUES') {
		this.nextToken();
		if (!this.matchDataBlock()) {
			this.error('No DataBlock after VALUES');
		}
		this.inform('Match InlineData');
		return true;
	}
	return false;
}

// DataBlock ::= InlineDataOneVar | InlineDataFull
tokenizer.matchDataBlock = function () {
	if (this.matchInlineDataOneVar() || this.matchInlineDataFull()) {
		this.inform('Match DataBlock');
		return true;
	}
	return false;
}

// InlineDataOneVar ::= Var '{' DataBlockValue* '}'
tokenizer.matchInlineDataOneVar = function () {
	//TO-DO
	return true;
}

// InlineDataFull ::= ( NIL | '(' Var* ')' ) '{' ( '(' DataBlockValue* ')' | NIL )* '}'
tokenizer.matchInlineDataFull = function () {
	//TO-DO
	return true;
}

// DataBlockValue ::= iri |	RDFLiteral | NumericLiteral | BooleanLiteral | 'UNDEF'
tokenizer.matchDataBlockValue = function () {
	var token = this.currentToken();
	if (this.matchiri() || this.matchRDFLiteral() || this.matchNumericLiteral() || this.matchBooleanLiteral() || token == 'UNDEF') {
		this.inform('Match DataBlockValue');
		return true;
	}
	return false;
}

// MinusGraphPattern ::= 'MINUS' GroupGraphPattern
tokenizer.matchMinusGraphPattern = function () {
	var token = this.currentToken();
	if (token == 'MINUS') {
		this.nextToken();
		if (!this.matchGroupGraphPattern()) {
			this.error('No DataBlock after MINUS');
		}
		this.inform('Match MinusGraphPattern');
		return true;
	}
	return false;
}

// GroupOrUnionGraphPattern ::= GroupGraphPattern ( 'UNION' GroupGraphPattern )*
tokenizer.matchGroupOrUnionGraphPattern = function () {
	return false;
	// TO-DO
}

// Filter ::= 'FILTER' Constraint
tokenizer.matchFilter = function () {
	var token = this.currentToken();
	if (token == 'FILTER') {
		this.nextToken();
		if (!this.matchConstraint()) {
			this.error('No Constraint after FILTER');
		}
		this.inform('Match Filter');
		return true;
	}
	return false;
}

// Constraint ::= BrackettedExpression | BuiltInCall | FunctionCall
tokenizer.matchConstraint = function () {
	if (this.matchBrackettedExpression() || this.matchBuiltInCall() || this.matchFunctionCall()) {
		this.inform('Match Constraint');
		return true;
	}
	return false;
}

// FunctionCall ::= iri ArgList
tokenizer.matchFunctionCall = function () {
	//TO-DO
}

// ArgList ::= NIL | '(' 'DISTINCT'? Expression ( ',' Expression )* ')'
tokenizer.matchArgList = function () {
	//TO-DO
}

// ExpressionList ::= NIL | '(' Expression ( ',' Expression )* ')'
tokenizer.matchExpressionList = function () {
	// TO-DO
}

// ConstructTemplate ::= '{' ConstructTriples? '}'
tokenizer.matchConstructTemplate = function () {
	//TO-DO
}

// ConstructTriples ::= TriplesSameSubject ( '.' ConstructTriples? )?
tokenizer.matchConstructTriples = function () {
	//TO-DO
}

// TriplesSameSubject ::= VarOrTerm PropertyListNotEmpty | TriplesNode PropertyList
tokenizer.matchTriplesSameSubject = function () {
	if (this.matchVarOrTerm()) {
		this.nextToken();
		if (this.matchPropertyListNotEmpty()) {
			this.inform('Match TriplesSameSubject');
			return true;
		}
		this.error('No PropertyListNotEmpty after VarOrTerm');
		return false;		
	}
	else if (this.matchTriplesNode()) {
		this.nextToken();
		if (this.matchPropertyList()) {
			this.inform('Match TriplesSameSubject');
			return true;
		}
		this.error('No PropertyList after TriplesNode');
		return false;
	}
	return false;
}

// PropertyList ::= PropertyListNotEmpty?
tokenizer.matchPropertyList = function () {
	this.matchPropertyListNotEmpty();
	this.inform('Match PropertyList');
	return true;
}

// PropertyListNotEmpty ::= Verb ObjectList ( ';' ( Verb ObjectList )? )*
tokenizer.matchPropertyListNotEmpty = function () {
	this.inform('Checking PropertyListNotEmpty');
	if (this.matchVerb()) {
		this.nextToken();
		if (this.matchObjectList()) {
			var token = this.nextToken();
			while (token == ';') {
				this.nextToken()
				if  (this.matchVerb()) {
					this.nextToken();
					if (this.matchObjectList()) {
						this.nextToken();
					}
					else this.error('No ObjectList after Verb');
				}
				else this.error('No Verb after \';\'');
			}
		}
		else {
			this.error('No ObjectList after Verb');
		}
		this.inform('Match PropertyListNotEmpty');
		return true;
	}
	return false;
}

// Verb ::= VarOrIri | 'a'
tokenizer.matchVerb = function () {
	var token = this.currentToken();
	if (this.matchVarOrIri() || token == 'a') {
		this.inform('Match Verb');
		return true;
	}
	return false;
}

// ObjectList ::= Object ( ',' Object )*
tokenizer.matchObjectList = function () {
	if (this.matchObject()) {
		var token = this.nextToken();
		while (token == ',') {
			this.nextToken()
			if  (this.matchObject()) {
				this.nextToken();
			}
			else this.error('No Object after \',\'');
		}
		this.inform('Match ObjectList');
		return true;
	}
	return false;
}

// Object ::= GraphNode
tokenizer.matchObject = function () {
	this.matchGraphNode();
}

// TriplesSameSubjectPath ::= VarOrTerm PropertyListPathNotEmpty | TriplesNodePath PropertyListPath
tokenizer.matchTriplesSameSubjectPath = function () {
	if (this.matchVarOrTerm()) {
		this.nextToken();
		if (this.matchPropertyListPathNotEmpty()) {
			this.inform('Match TriplesSameSubjectPath');
			return true;
		}
		this.error('No PropertyListPathNotEmpty after VarOrTerm');
		return false;
	}
	else if (this.matchTriplesNodePath()) {
		this.nextToken();
		if (this.matchPropertyListPath()) {
			this.inform('Match TriplesSameSubjectPath');
			return true;
		}
		this.error('No PropertyListPath after TriplesNodePath');
		return false;
	}
	return false;
}

// PropertyListPath ::= PropertyListPathNotEmpty?
tokenizer.matchPropertyListPath = function () {
	this.matchPropertyListPathNotEmpty();
	this.inform('Match PropertyListPath');
	return true;
}

// PropertyListPathNotEmpty ::= ( VerbPath | VerbSimple ) ObjectListPath ( ';' ( ( VerbPath | VerbSimple ) ObjectList )? )*
tokenizer.matchPropertyListPathNotEmpty = function () {
	if (this.matchVerbPath() || this.matchVerbSimple) {
		this.nextToken();
	}
	if (this.matchObjectListPath()) {
		var token = this.nextToken();
		while (token == ';') {
			this.nextToken()
			if (this.matchVerbPath() || this.matchVerbSimple) {
				this.nextToken();
			}
			if  (this.matchObjectPath()) {
				this.nextToken();
			}
		}
		this.inform('Match PropertyListPathNotEmpty');
		return true;
	}
	return false;
}

// VerbPath ::= Path
tokenizer.matchVerbPath = function () {
	this.matchPath();
}

// VerbSimple ::= Var
tokenizer.matchVerbSimple = function () {
	this.matchVar();
}

// ObjectListPath ::= ObjectPath ( ',' ObjectPath )*
tokenizer.matchObjectListPath = function () {
	if (this.matchObjectPath()) {
		var token = this.nextToken();
		while (token == ',') {
			this.nextToken()
			if  (this.matchObjectPath()) {
				this.nextToken();
			}
			else this.error('No ObjectPath after \',\'');
		}
		this.inform('Match ObjectListPath');
		return true;
	}
	return false;
}

// ObjectPath ::= GraphNodePath
tokenizer.matchObjectPath = function () {
	this.matchGraphNodePath();
}

// Path ::= PathAlternative
tokenizer.matchPath = function () {
	this.matchPathAlternative();
}

// PathAlternative ::= PathSequence ( '|' PathSequence )*
tokenizer.matchPathAlternative = function () {
	//TO-DO
	return true;
}

// PathSequence ::= PathEltOrInverse ( '/' PathEltOrInverse )*
tokenizer.matchPathSequence = function () {
	//TO-DO
}

// PathElt ::= PathPrimary PathMod?
tokenizer.matchPathElt = function () {
	//TO-DO
}

// PathEltOrInverse ::= PathElt | '^' PathElt
tokenizer.matchPathEltOrInverse = function () {
	//TO-DO
}

// PathMod ::= '?' | '*' | '+'
tokenizer.matchPathMod = function () {
	//TO-DO
}

// PathPrimary ::= iri | 'a' | '!' PathNegatedPropertySet | '(' Path ')'
tokenizer.matchPathPrimary = function () {
	//TO-DO
}

// PathNegatedPropertySet ::= PathOneInPropertySet | '(' ( PathOneInPropertySet ( '|' PathOneInPropertySet )* )? ')'
tokenizer.matchPathNegatedPropertySet = function () {
	//TO-DO
}

// PathOneInPropertySet ::= iri | 'a' | '^' ( iri | 'a' )
tokenizer.matchPathOneInPropertySet = function () {
	//TO-DO
}

// Integer ::= INTEGER
tokenizer.matchInteger = function () {
	this.matchINTEGER();
}

// TriplesNode ::= Collection | BlankNodePropertyList
tokenizer.matchTriplesNode = function () {
	if (this.matchCollection() || this.matchBLANK_NODE_LABEL()) {
		this.inform('Match TriplesNode');
		return true;
	}
	return false;
}

// BlankNodePropertyList ::= '[' PropertyListNotEmpty ']'
tokenizer.matchBlankNodePropertyList = function () {
	//TO-DO
}

// TriplesNodePath ::= CollectionPath | BlankNodePropertyListPath
tokenizer.matchTriplesNodePath = function () {
	if (this.matchCollectionPath() || this.matchBlankNodePropertyListPath()) {
		this.inform('Match TriplesNodePath');
		return true;
	}
	return false;
}

// BlankNodePropertyListPath ::= '[' PropertyListPathNotEmpty ']'
tokenizer.matchBlankNodePropertyListPath = function () {
	//TO-DO
}

// Collection ::= '(' GraphNode+ ')'
tokenizer.matchCollection = function () {
	//TO-DO
}

// CollectionPath ::= '(' GraphNodePath+ ')'
tokenizer.matchCollectionPath = function () {
	//TO-DO
}

// GraphNode ::= VarOrTerm | TriplesNode
tokenizer.matchGraphNode = function () {
	if (this.matchVarOrTerm() || this.matchTriplesNode()) {
		this.inform('Match GraphNode');
		return true;
	}
	return false;
}

// GraphNodePath ::= VarOrTerm | TriplesNodePath
tokenizer.matchGraphNodePath = function () {
	if (this.matchVarOrTerm() || this.matchTriplesNodePath()) {
		this.inform('Match GraphNodePath');
		return true;
	}
	return false;
}

// VarOrTerm ::= Var | GraphTerm
tokenizer.matchVarOrTerm = function () {
	if (this.matchVar() || this.matchGraphTerm()) {
		this.inform('Match VarOrTerm');
		return true;
	}
	return false;
}

// VarOrIri ::= Var | iri
tokenizer.matchVarOrIri = function (text) {
	if (this.matchVar() || this.matchiri()) {
		this.inform('Match VarOrIri');
		return true;
	}
	return false;
}

// Var ::= VAR1 | VAR2
tokenizer.matchVar = function () {
	var token = this.currentToken();
	if (this.matchVAR1(token) || this.matchVAR2(token)) {
		this.variables.push(token);
		this.inform('Match Var');
		return true;
	}
	return false;
}

// GraphTerm ::= iri | RDFLiteral | NumericLiteral | BooleanLiteral | BlankNode | NIL
tokenizer.matchGraphTerm = function (term) {
	if (this.matchiri(term) || this.matchRDFLiteral(term) || this.matchNumericLiteral(term) || this.matchBooleanLiteral(term) || this.matchBlankNode(term) || this.matchNIL(term)) {
		this.inform('Match GraphTerm');
		return true;
	}
	return false;
}

// Expression ::= ConditionalOrExpression
tokenizer.matchExpression = function () {
	this.matchConditionalOrExpression();
}

// ConditionalOrExpression ::= ConditionalAndExpression ( '||' ConditionalAndExpression )*
tokenizer.matchConditionalOrExpression = function () {
	// TO-DO
}

// ConditionalAndExpression ::= ValueLogical ( '&&' ValueLogical )*
tokenizer.matchConditionalAndExpression = function () {
	// TO-DO
}

// ValueLogical ::= RelationalExpression
tokenizer.matchValueLogical = function () {
	this.matchRelationalExpression();
}

// RelationalExpression ::= NumericExpression ( '=' NumericExpression | '!=' NumericExpression | '<' NumericExpression | '>' NumericExpression | '<=' NumericExpression | '>=' NumericExpression | 'IN' ExpressionList | 'NOT' 'IN' ExpressionList )?
tokenizer.matchRelationalExpression = function () {
	// TO-DO
}

// NumericExpression ::= AdditiveExpression
tokenizer.matchNumericExpression = function () {
	this.matchAdditiveExpression();
}

// AdditiveExpression ::= MultiplicativeExpression ( '+' MultiplicativeExpression | '-' MultiplicativeExpression | ( NumericLiteralPositive | NumericLiteralNegative ) ( ( '*' UnaryExpression ) | ( '/' UnaryExpression ) )* )*
tokenizer.matchAdditiveExpression = function () {
	// TO-DO
}

// MultiplicativeExpression ::= UnaryExpression ( '*' UnaryExpression | '/' UnaryExpression )*
tokenizer.matchMultiplicativeExpression = function () {
	// TO-DO
}

// UnaryExpression ::= '!' PrimaryExpression | '+' PrimaryExpression | '-' PrimaryExpression | PrimaryExpression
tokenizer.matchUnaryExpression = function () {
	// TO-DO
}

// PrimaryExpression ::= BrackettedExpression | BuiltInCall | iriOrFunction | RDFLiteral | NumericLiteral | BooleanLiteral | Var
tokenizer.matchPrimaryExpression = function () {
	// TO-DO
}

// BrackettedExpression ::= '(' Expression ')'
tokenizer.matchBrackettedExpression = function () {
	//TO-DO
}

// BuiltInCall ::= Aggregate 
// | 'STR' '(' Expression ')' 
// | 'LANG' '(' Expression ')' 
// | 'LANGMATCHES' '(' Expression ',' Expression ')' 
// | 'DATATYPE' '(' Expression ')' 
// | 'BOUND' '(' Var ')' 
// | 'IRI' '(' Expression ')' 
// | 'URI' '(' Expression ')' 
// | 'BNODE' ( '(' Expression ')' | NIL ) 
// | 'RAND' NIL 
// | 'ABS' '(' Expression ')' 
// | 'CEIL' '(' Expression ')' 
// | 'FLOOR' '(' Expression ')' 
// | 'ROUND' '(' Expression ')' 
// | 'CONCAT' ExpressionList 
// | SubstringExpression 
// | 'STRLEN' '(' Expression ')' 
// | StrReplaceExpression 
// | 'UCASE' '(' Expression ')' 
// | 'LCASE' '(' Expression ')' 
// | 'ENCODE_FOR_URI' '(' Expression ')' 
// | 'CONTAINS' '(' Expression ',' Expression ')' 
// | 'STRSTARTS' '(' Expression ',' Expression ')' 
// | 'STRENDS' '(' Expression ',' Expression ')' 
// | 'STRBEFORE' '(' Expression ',' Expression ')' 
// | 'STRAFTER' '(' Expression ',' Expression ')' 
// | 'YEAR' '(' Expression ')' 
// | 'MONTH' '(' Expression ')' 
// | 'DAY' '(' Expression ')' 
// | 'HOURS' '(' Expression ')' 
// | 'MINUTES' '(' Expression ')' 
// | 'SECONDS' '(' Expression ')' 
// | 'TIMEZONE' '(' Expression ')' 
// | 'TZ' '(' Expression ')' 
// | 'NOW' NIL 
// | 'UUID' NIL 
// | 'STRUUID' NIL 
// | 'MD5' '(' Expression ')' 
// | 'SHA1' '(' Expression ')' 
// | 'SHA256' '(' Expression ')' 
// | 'SHA384' '(' Expression ')' 
// | 'SHA512' '(' Expression ')' 
// | 'COALESCE' ExpressionList 
// | 'IF' '(' Expression ',' Expression ',' Expression ')' 
// | 'STRLANG' '(' Expression ',' Expression ')' 
// | 'STRDT' '(' Expression ',' Expression ')' 
// | 'sameTerm' '(' Expression ',' Expression ')' 
// | 'isIRI' '(' Expression ')' 
// | 'isURI' '(' Expression ')' 
// | 'isBLANK' '(' Expression ')' 
// | 'isLITERAL' '(' Expression ')' 
// | 'isNUMERIC' '(' Expression ')' 
// | RegexExpression 
// | ExistsFunc 
// | NotExistsFunc
tokenizer.matchBuiltInCall = function () {
	//TO-DO
}

// RegexExpression ::= 'REGEX' '(' Expression ',' Expression ( ',' Expression )? ')'
tokenizer.matchRegexExpression = function () {
	//TO-DO
}

// SubstringExpression ::= 'SUBSTR' '(' Expression ',' Expression ( ',' Expression )? ')'
tokenizer.matchSubstringExpression = function () {
	//TO-DO
}

// StrReplaceExpression ::= 'REPLACE' '(' Expression ',' Expression ',' Expression ( ',' Expression )? ')'
tokenizer.matchStrReplaceExpression = function () {
	//TO-DO
}

// ExistsFunc ::= 'EXISTS' GroupGraphPattern
tokenizer.matchExistsFunc = function () {
	//TO-DO
}

// NotExistsFunc ::= 'NOT' 'EXISTS' GroupGraphPattern
tokenizer.matchNotExistsFunc = function () {
	//TO-DO
}

// Aggregate ::= 'COUNT' '(' 'DISTINCT'? ( '*' | Expression ) ')' 
// | 'SUM' '(' 'DISTINCT'? Expression ')' 
// | 'MIN' '(' 'DISTINCT'? Expression ')' 
// | 'MAX' '(' 'DISTINCT'? Expression ')' 
// | 'AVG' '(' 'DISTINCT'? Expression ')' 
// | 'SAMPLE' '(' 'DISTINCT'? Expression ')' 
// | 'GROUP_CONCAT' '(' 'DISTINCT'? Expression ( ';' 'SEPARATOR' '=' String )? ')'
tokenizer.matchAggregate = function () {
	//TO-DO
}

// iriOrFunction ::= iri ArgList?
tokenizer.matchiriOrFunction = function () {
	//TO-DO
}

// RDFLiteral ::= String ( LANGTAG | ( '^^' iri ) )?
tokenizer.matchRDFLiteral = function () {
	//TO-DO
}

// NumericLiteral ::= NumericLiteralUnsigned | NumericLiteralPositive | NumericLiteralNegative
tokenizer.matchNumericLiteral = function (ints) {
	if (this.matchNumericLiteralUnsigned(ints) || this.matchNumericLiteralPositive(ints) || this.matchNumericLiteralNegative(ints)) {
		this.inform('Match NumericLiteralNegative');
		return true;
	}
	return false;
}

// NumericLiteralUnsigned ::= INTEGER | DECIMAL | DOUBLE
tokenizer.matchNumericLiteralUnsigned = function (ints) {
	if (this.matchINTEGER(ints) || this.matchDECIMAL(ints) || this.matchDOUBLE(ints)) {
		this.inform('Match NumericLiteral');
		return true;
	}
	return false;
}

// NumericLiteralPositive ::= INTEGER_POSITIVE | DECIMAL_POSITIVE | DOUBLE_POSITIVE
tokenizer.matchNumericLiteralPositive = function (ints) {
	if (this.matchINTEGER_POSITIVE(ints) || this.matchDECIMAL_POSITIVE(ints) || this.matchDOUBLE_POSITIVE(ints)) {
		this.inform('Match NumericLiteralPositive');
		return true;
	}
	return false;
}

// NumericLiteralNegative ::= INTEGER_NEGATIVE | DECIMAL_NEGATIVE | DOUBLE_NEGATIVE
tokenizer.matchNumericLiteralNegative = function (ints) {
	if (this.matchINTEGER_NEGATIVE(ints) || this.matchDECIMAL_NEGATIVE(ints) || this.matchDOUBLE_NEGATIVE(ints)) {
		this.inform('Match NumericLiteralNegative');
		return true;
	}
	return false;
}

// BooleanLiteral ::= 'true' | 'false'
tokenizer.matchBooleanLiteral = function (bool) {
	if (bool == true || bool == false) {
		this.inform('Match BooleanLiteral');
		return true;
	}
	return false;
}

// String ::= STRING_LITERAL1 | STRING_LITERAL2 | STRING_LITERAL_LONG1 | STRING_LITERAL_LONG2
tokenizer.matchString = function (string) {
	if (this.matchSTRING_LITERAL1(string) || this.matchSTRING_LITERAL2(string) || this.matchSTRING_LITERAL_LONG1(string) || this.matchSTRING_LITERAL_LONG2(string)) {
		this.inform('Match String');
		return true;
	}
	return false;
}

// iri ::= IRIREF | PrefixedName
tokenizer.matchiri = function (name) {
	if (this.matchIRIREF(name) || this.matchPrefixedName(name)) {
		this.inform('Match iri');
		return true;
	}
	return false;
}

// PrefixedName ::= PNAME_LN | PNAME_NS
tokenizer.matchPrefixedName = function (name) {
	if (this.matchPNAME_LN(name) || this.matchPNAME_NS(name)) {
		this.inform('Match PrefixedName');
		return true;
	}
	return false;
}

// BlankNode ::= BLANK_NODE_LABEL |	ANON
tokenizer.matchBlankNode = function (node) {
	if (this.matchBLANK_NODE_LABEL(node) || this.matchANON(node)) {
		this.inform('Match BlankNode');
		return true;
	}
	return false;
}

// #################################################################################################
// #                                                                                               #
// #                                      SPARQL TERMINALS                                         #
// #                                                                                               #
// #################################################################################################

// IRIREF ::= '<' ([^<>"{}|^`\]-[#x00-#x20])* '>'
tokenizer.matchIRIREF = function () {
	// TO-DO
}

// PNAME_NS ::= PN_PREFIX? ':'
tokenizer.matchPNAME_NS = function () {
	// TO-DO
}

// PNAME_LN ::= PNAME_NS PN_LOCAL
tokenizer.matchPNAME_LN = function () {
	// TO-DO
}

// BLANK_NODE_LABEL ::= '_:' ( PN_CHARS_U | [0-9] ) ((PN_CHARS|'.')* PN_CHARS)?
tokenizer.matchBLANK_NODE_LABEL = function () {
	// TO-DO
}

// VAR1 ::= '?' VARNAME
tokenizer.matchVAR1 = function (text) {
	if (text.charAt(0) == '?' && this.matchVARNAME(text.substring(1))) {
		this.inform('Match VAR1');
		return true;
	}
	return false;
}

// VAR2 ::= '$' VARNAME
tokenizer.matchVAR2 = function (text) {
	if (text.charAt(0) == '$' && this.matchVARNAME(text.substring(1))) {
		this.inform('Match VAR2');
		return true;
	}
	return false;
}

// LANGTAG ::= '@' [a-zA-Z]+ ('-' [a-zA-Z0-9]+)*
tokenizer.matchLANGTAG = function () {
	// TO-DO
}

// INTEGER ::=  [0-9]+
tokenizer.matchINTEGER = function () {
	// TO-DO
}

// DECIMAL ::= [0-9]* '.' [0-9]+
tokenizer.matchDECIMAL = function () {
	// TO-DO
}

// DOUBLE ::= [0-9]+ '.' [0-9]* EXPONENT | '.' ([0-9])+ EXPONENT | ([0-9])+ EXPONENT
tokenizer.matchDOUBLE = function () {
	// TO-DO
}

// INTEGER_POSITIVE ::= '+' INTEGER
tokenizer.matchINTEGER_POSITIVE = function () {
	// TO-DO
}

// DECIMAL_POSITIVE ::= '+' DECIMAL
tokenizer.matchDECIMAL_POSITIVE = function () {
	// TO-DO
}

// DOUBLE_POSITIVE ::= '+' DOUBLE
tokenizer.matchDOUBLE_POSITIVE = function () {
	// TO-DO
}

// INTEGER_NEGATIVE ::= '-' INTEGER
tokenizer.matchINTEGER_NEGATIVE = function () {
	// TO-DO
}

// DECIMAL_NEGATIVE ::= '-' DECIMAL
tokenizer.matchDECIMAL_NEGATIVE = function () {
	// TO-DO
}

// DOUBLE_NEGATIVE ::= '-' DOUBLE
tokenizer.matchDOUBLE_NEGATIVE = function () {
	// TO-DO
}

// EXPONENT ::= [eE] [+-]? [0-9]+
tokenizer.matchEXPONENT = function () {
	// TO-DO
}

// STRING_LITERAL1 ::= "'" ( ([^#x27#x5C#xA#xD]) | ECHAR )* "'"
tokenizer.matchSTRING_LITERAL1 = function () {
	// TO-DO
}

// STRING_LITERAL2 ::= '"' ( ([^#x22#x5C#xA#xD]) | ECHAR )* '"'
tokenizer.matchSTRING_LITERAL2 = function () {
	// TO-DO
}

// STRING_LITERAL_LONG1 ::= "'''" ( ( "'" | "''" )? ( [^'\] | ECHAR ) )* "'''"
tokenizer.matchSTRING_LITERAL_LONG1 = function () {
	// TO-DO
}

// STRING_LITERAL_LONG2 ::= '"""' ( ( '"' | '""' )? ( [^"\] | ECHAR ) )* '"""'
tokenizer.matchSTRING_LITERAL_LONG2 = function () {
	// TO-DO
}

// ECHAR ::= '\' [tbnrf\"']
tokenizer.matchECHAR = function () {
	// TO-DO
}

// NIL ::= '(' WS* ')'
tokenizer.matchNIL = function () {
	// TO-DO
}

// WS ::= #x20 | #x9 | #xD | #xA
tokenizer.matchWS = function () {
	// TO-DO
}

// ANON ::= '[' WS* ']'
tokenizer.matchANON = function () {
	// TO-DO
}

// BROKEN!!!
// PN_CHARS_BASE ::= [A-Z] | [a-z] | [#x00C0-#x00D6] | [#x00D8-#x00F6] | [#x00F8-#x02FF] | [#x0370-#x037D] | [#x037F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
tokenizer.matchPN_CHARS_BASE = function (character) {
	/*if ((/^[A-Za-z#x00C0-#x00D6#x00D8-#x00F6#x00F8-#x02FF#x0370-#x037D#x037F-#x1FFF#x200C-#x200D#x2070-#x218F#x2C00-#x2FEF#x3001-#xD7FF#xF900-#xFDCF#xFDF0-#xFFFD#x10000-#xEFFFF]$/).test(character)) {
		this.inform('Match PN_CHARS_BASE');
		return true;
	}*/
	return true;
}

// PN_CHARS_U ::= PN_CHARS_BASE | '_'
tokenizer.matchPN_CHARS_U = function (character) {
	if (this.matchPN_CHARS_BASE(character) || character == '_') {
		this.inform('Match PN_CHARS_U');
		return true;
	}
	return false;
}

// BROKEN!!!
// VARNAME ::= ( PN_CHARS_U | [0-9] ) ( PN_CHARS_U | [0-9] | #x00B7 | [#x0300-#x036F] | [#x203F-#x2040] )*
tokenizer.matchVARNAME = function (text) {
	var firstChar = text.charAt(0);
	if (this.matchPN_CHARS_U(firstChar) || (/^[0-9]$/).test(firstChar)) {
		var index = 1;
		while (index < text.length) {
			var tempChar = text.charAt(index);
			/*if (!this.matchPN_CHARS_U(tempChar) && !(/^[0-9#x00B7#x0300-#x036F#x203F-#x2040]$/).test(tempChar)) {
				this.error('Unexpected character in VARNAME');
			}*/
			index++;
		}
		this.inform('Match VARNAME');
		return true;
	}
	return false;
}

// BROKEN!!!
// PN_CHARS ::= PN_CHARS_U | '-' | [0-9] | #x00B7 | [#x0300-#x036F] | [#x203F-#x2040]
tokenizer.matchPN_CHARS = function (character) {
	/*if (this.matchPN_CHARS_U(character) || character == '-' || (/^[0-9#x00B7#x0300-#x036F#x203F-#x2040]$/).test(character)) {
		this.inform('Match PN_CHARS');
		return true;
	}*/
	return true;
}

// PN_PREFIX ::= PN_CHARS_BASE ((PN_CHARS | '.')* PN_CHARS)?
tokenizer.matchPN_PREFIX = function () {
	// TO-DO
}

// PN_LOCAL ::= (PN_CHARS_U | ':' | [0-9] | PLX ) ((PN_CHARS | '.' | ':' | PLX)* (PN_CHARS | ':' | PLX) )?
tokenizer.matchPN_LOCAL = function () {
	// TO-DO
}

// PLX ::= PERCENT | PN_LOCAL_ESC
tokenizer.matchPLX = function (text) {
	if (this.matchPERCENT(text) || this.matchPN_LOCAL_ESC(text)) {
		this.inform('Match PLX');
		return true;
	}
	return false;
}

// PERCENT ::= '%' HEX HEX
tokenizer.matchPERCENT = function (text) {
	var firstChar = text.charAt(0);
	var secondChar = text.charAt(1);
	var thirdChar = text.charAt(2);
	if (firstChar == '%' && this.matchHEX(secondChar) && this.matchHEX(thirdChar)) {
		this.inform('Match PERCENT');
		return true;
	}
	return false;
}

// SHOULD WORK...
// HEX ::= [0-9] | [A-F] | [a-f]
tokenizer.matchHEX = function (character) {
	if ((/^[0-9a-fA-F]$/).test(character)) {
		this.inform('Match HEX');
		return true;
	}
	return false;
}

// SHOULD WORK...
// PN_LOCAL_ESC ::= '\' ( '_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%' )
tokenizer.matchPN_LOCAL_ESC = function (text) {
	var secondChar = text.charAt(1);
	if (token.charAt(0) == '\\') {
		if (secondChar == '_' || secondChar == '~' || secondChar == '.' || secondChar == '-' || secondChar == '!' || secondChar ==  '$' || secondChar == '&' || secondChar == "'" || secondChar == '(' || secondChar == ')' || secondChar == '*' || secondChar == '+' || secondChar == ',' || secondChar == ';' || secondChar == '=' || secondChar == '/' || secondChar == '?' || secondChar == '#' || secondChar == '@' || secondChar == '%') {
			this.inform('Match PN_LOCAL_ESC');
			return true;
		}
	}
	return false;
}
