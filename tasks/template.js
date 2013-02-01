var Template = function(){
	if (!(this instanceof Template)) {
		return new Template();
	}
	var that = this;
	that.interpolation = /\{(.*?)\}/g;
	that.fn = /\!/;
	that.clean = function(arr){
		var arra = [];
		for(var i = 0; i < arr.length; i += 1){
			arra.push(arr[i].replace(/[\{\}]/gi, ''));
		}
	};
	that.fns  = function(arr){
		var fns = [];
		for(var i = 0; i < arr.length; i += 1){
			if(that.fn.test(arr[i])){
				fns.push(arr[i].replace(that.fn, '').split(','));
			}
		}
	};
	that.render = function(str, data, callback){

	};	
};

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
// for(var i = 0; i < fns.length; i += 1){
//   var set = fns[i];
//   var fun = set[0];
//   set.shift();
//   console.log(fns2[fun](set));
// }

