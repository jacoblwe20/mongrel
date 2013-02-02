module.exports = function(points){
  points = points[0];
  var length = points.length
  var arr = [0, 0];
  for(var i = 0; i < length; i += 1){
    //console.log([arr, points[i]]);
    arr[0] += parseFloat(points[i][0]);
    arr[1] += parseFloat(points[i][1]);
  }
  arr[0] = arr[0]/length;
  arr[1] = arr[1]/length;
  return arr;
};