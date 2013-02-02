var Template = function(){
	if (!(this instanceof Template)) {
		return new Template();
	}
	var that = this;
	that.interpolation = /\{(.*?)\}/g;
	that.fn = /\!/;
	that.variables = function(str){
		return str.match(that.interpolation);
	};
	that.clean = function(arr){
		var arra = [];
		for(var i = 0; i < arr.length; i += 1){
			arra.push(arr[i].replace(/[\{\}]/gi, ''));
		}
		return arra;
	};
	that.fnsData = function(fns, data){
		var arr = [];
		if(typeof fns === 'object'){
			for(var k = 0; k < fns.length; k += 1){
				var arra = [];
				var fn = fns[k];
				if(typeof fn === 'object'){
					arra.push(fn[0]);
					for(var i = 1; i < fn.length; i += 1){
						var key = fn[i];
						arra.push(data[key]);
					}
				}
				arr.push(arra);
			}
		}
		return arr;
	};
	that.fns  = function(arr){
		var fns = [];
		if(typeof arr === 'object' && arr.length){
			for(var i = 0; i < arr.length; i += 1){
				if(that.fn.test(arr[i])){
					fns.push(arr[i].replace(that.fn, '').split(','));
				}
			}
		}
		return fns;
	};
	that.concat = function(str, vars, data){
		var stg = str.toString();
		if(typeof vars === 'object' && vars.length){
			for(var i = 0; i <  vars.length; i += 1){
				if(typeof vars[i] === 'string'){
					var pattern = vars[i].replace(/ /g,'');
					pattern = '{' + pattern + '}';
					pattern = new RegExp(pattern, 'gi');
					if(data[vars[i]]){
						stg = stg.replace(pattern, data[vars[i]]);
					}
				}
			}
		}
		return stg;
	};
	that.render = function(str, data, callback){
		var vars = (str) ? that.clean(that.variables(str)) : null;
		var fns =  (vars) ? that.fns(vars) : null;
		var stg = (vars) ? that.concat(str, vars, data) : null;
		(fns.length > 0) ? fns = that.fnsData(fns, data) : fns = null;
		callback(stg, fns);
	};	
};

module.exports = Template;

// ################################
// Example of excuting function
// ################################
//
// var fns2 = {
//   hello : function(arr){
//    return parseFloat(arr[0]) + parseFloat(arr[1]);
//   }
// }
//


