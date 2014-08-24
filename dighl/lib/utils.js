function sum(list)
{
  function add(prev, foll){return prev + foll;}
  return list.reduce(add);
}
function max(list)
{
  function compare(prev,foll)
  {
    if(prev == foll){return prev;}
    else if(prev > foll){return prev;}
    else{return foll}
  }
  return list.reduce(compare);
}
function range(start,stop,step)
{
  if(typeof step == 'undefined'){step=1}
  if(typeof stop == 'undefined'){stop=start;start=0}
  
  if(stop > start && step < 0){return undefined}
  if(step == 0){return undefined}
  
  
  var list = [];
  if(start < stop)
  {
    for(var i=start;i<stop;i+=step)
    {
      list.push(i);
    }
  }
  else if(stop < start)
  {
    for(var i=start;i>stop;i+=step)
    {
      list.push(i);
    }
  }
  else{return undefined}
  return list;
}

function loadFile(url,async)
{
  if(typeof async == 'undefined')
  {
    async = false;
  }
  else
  {
    async = true;
  }

  var store = document.getElementById('store');
  if(store === null)
  {
    var store = document.createElement('div');
    store.style.display = "none";
    document.body.appendChild(store);
  }

  $.ajax({
    async: async,
    type: "GET",
    url: url,
    dataType: "text",
    success: function(data) { store.innerText = data; }
  });
}

/* http://stackoverflow.com/questions/1141302/is-there-a-sleep-function-in-javascript */
function sleep(delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

function transpose(array)
{
  try{
  var new_array = [];
  for(var i=0;i<array[0].length;i++)
  {
    var tmp_row = [];
    for(var j=0;j<array.length;j++)
    {
      tmp_row.push(array[j][i]);
    }
    new_array.push(tmp_row);
  }
  return new_array;
  }
  catch(e)
  {
    alert("TRANSPOSE ERROR: "+JSON.stringify(array));
    return array;
        }
}
