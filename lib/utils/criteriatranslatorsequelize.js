/*
 * This file is part of the EcoLearnia platform.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcoLearnia v0.0.1
 *
 * @fileoverview
 *  This file includes definition of HapiResource.
 *
 * @author Young Suk Ahn Park
 * @date 6/10/15
 */
 var lodash = require('lodash');

// Declaration of namespace for internal module use
var internals = {};

internals.SEQUELIZE_OP = {
	'=' : '$eq',
	'!=' : '$ne',
	'>' : '$gt',
	'>=': '$gte',
	'<' : '$lt',
	'<=' : '$lte',
	'in' : '$in',
	'nin' : '$notIn',
	'or' : '$or',
	'and' : '$and',
  'like' : '$like',
}

/**
 * @class CriteriaTranslator
 * @static
 */
internals.CriteriaTranslator = {
}


/**
 * Translates a eco-criteria into Sequelize JSON critiera
 */
internals.CriteriaTranslator.translate = function(criteria)
{
	if (!criteria) {
		return null;
	}
    var sequelizeCriteria = internals.CriteriaTranslator.translatelRecursive_(criteria);

    return sequelizeCriteria;
}

internals.CriteriaTranslator.translatelRecursive_ = function(node)
{
	var sequelizeCriteria = {};
	if (node.op && (node.op == 'or' || node.op == 'and')) {
		var children = [];
		sequelizeCriteria[ internals.SEQUELIZE_OP[node.op] ] = children;
		if (node.args && node.args.length && node.args.length > 0)
		{
	    	for(var i=0; i < node.args.length; i++)
	    	{
	    		var child = this.translatelRecursive_(node.args[i]);
	    		children.push(child);
	    	}
	    }
	}
	else if (node.op) {
		var predicateObj = {};
		if (node.op === '=') {
			// Pre Mong 3.0  there is no $eq, it's just the value
			predicateObj = node.val;
		} else if (node.op === 'like') {
			// Change like to regex
			var wildHead = lodash.startsWith(node.val, '%');
			var wildTail = lodash.endsWith(node.val, '%');

			var pattern = node.val;
			if (wildHead && wildTail) {
				pattern = pattern.substring(1, pattern.length-1);
			} else if (wildHead && !wildTail) {
				pattern = pattern.substring(1, pattern.length) + '$';
			} else if (!wildHead && wildTail) {
				pattern = '^' + pattern.substring(0, pattern.length-1);
			} else {
				pattern = '^' + pattern + '$';
			}

			predicateObj[ '$regex' ] = new RegExp(pattern);
		} else {
			predicateObj[ internals.SEQUELIZE_OP[node.op] ] = node.val;
		}
		sequelizeCriteria[node.var] = predicateObj
	}
	else if (node.between) {

		var predicateObj = {};
		predicateObj[ internals.SEQUELIZE_OP['>='] ] = node.between.from;
		predicateObj[ internals.SEQUELIZE_OP['<='] ] = node.between.to;

		sequelizeCriteria[node.var] = predicateObj
	}

    return sequelizeCriteria;
};


module.exports.CriteriaTranslatorSequelize = internals.CriteriaTranslator;
