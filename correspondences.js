/* Correspondence Viewer for LingPy Cognate Judgments
 *
 * author   : Johann-Mattis List
 * email    : mattis.list@lingulist.de
 * created  : 2014-08-20 11:51
 * modified : 2014-08-20 11:51
 *
 */

/* we store namespaces of this app as COVI */
var COVI = {};

/* store sorting options */
COVI.SORTED = {};
COVI.settings = {};
COVI.selections = [];
COVI.getCorrs = function (event)
{
  if(event.keyCode != 13)
  {
    return;
  }
  var corrs = document.getElementById('language_selector');
  var this_lang = corrs.value;
  
  COVI.showCorrs(this_lang);
}

COVI.showCorrs = function (this_lang)
{
  /* just write the simple header notice to this part */
  var source = document.getElementById('correspondence_header');
  source.innerHTML = "Sound Correspondences between "+this_lang+" and the other doculects:";

  /* check for sorted stuff */
  if(this_lang in COVI.SORTED)
  {
    var keys = COVI.SORTED[this_lang];
  }
  else
  {
    var keys = [];
  
    /* get all keys for the language */
    for(key in CORRS)
    {
      var tmp = key.split('.')[0];
      if(tmp == this_lang)
      {
        keys.push(key);
      }
    }
    keys.sort();
  }
  
  /* add sorted status of current table to sorter */
  var tmp = [];
  var lines = document.getElementsByClassName('ctab_numbers');
  if(lines.length != 0)
  {
    for(var i=0,elm;elm=lines[i];i++)
    {
      tmp.push(elm.dataset['value']);
    }
    COVI.SORTED[lines[0].dataset['value'].split('.')[0]] = tmp;
  }  

  var olangs = [];
  for(var i=0;i<LANGS.length;i++)
  {
    if(this_lang != LANGS[i] && COVI.selections.indexOf(LANGS[i]) != -1)
    {
      olangs.push(LANGS[i]);
    }
  }
  olangs.sort();

  var header = '<thead><tr><th class="source">NUMBER</th><th class="source">SOUND</th><th class="source">CONTEXT</th><th class="targets" onclick="COVI.showCorrs(this.innerHTML)">'+olangs.join('</th><th class="targets" onclick="COVI.showCorrs(this.innerHTML)">')+'</th></tr></thead>';

  var txt = '<table id="correspondence_table">'+header;
  txt += '<tbody id="correspondence_table_body">';
  
  var counter = 0;

  for(var i=0;i<keys.length;i++)
  {
    key = keys[i];
    
    var this_sound = key.split('.')[1];
    var this_context = key.split('.')[2];

    var tbl = [];

    for(var j=0;j<olangs.length;j++)
    {
      tbl.push('-');
    }

    for(k in CORRS[key])
    {
      var tmp = k.split('.');
      var other_lang = tmp[0];
      var other_sound = tmp[1];

      var idx = olangs.indexOf(other_lang);
      
      /* make sure sound occurs more than just once in correspondence relation */
      if(CORRS[key][k] > 1)
      {
        if(tbl[idx] == '-')
        {
          tbl[idx] = plotWord(other_sound) +'<span style="display:table-cell">('+CORRS[key][k]+')</span>';
        }
        else
        {
          tbl[idx] += '<div style="margin-bottom:2px;">'+plotWord(other_sound) + '<span style="display:table-cell">('+CORRS[key][k]+')</span>';
        }
      }
    }
    counter += 1;
    txt += '<tr class="correspondence_row" id="tr_'+key+'"><td data-value="'+key+'" class="ctab_numbers source" id="cnum_'+counter+'">'+counter+'</td><td class="source" style="cursor:pointer" onclick="COVI.showOccurrences(\''+key+'\')">'+plotWord(this_sound)+'</td><td class="source">'+this_context+'</td><td>'+tbl.join('</td><td>')+'</td></tr>';
  }
  
  /* make table sortable */
  document.getElementById('correspondence_data').innerHTML = txt+'</tbody></table>';

  $('#correspondence_table tbody').sortable({
    start: function( event, ui ) {      
      clone = $(ui.item[0].outerHTML).clone();},
    placeholder: {
      element: function(clone, ui) {
        return $('<tr class="selected" style="opacity:0.2;">'+clone[0].innerHTML+'</tr>');},
      update: function() {
        return;}},
    handle: ".ctab_numbers"
  });

  //$('#correspondence_table tbody tr').addClass('ui-helper-clearfix');
  
  COVI.resizeTable();
  
  $('#correspondence_data').perfectScrollbar({suppressScrollY:true});
  $('#correspondence_table_body').perfectScrollbar();
}

COVI.resizeTable = function ()
{
  // Change the selector if needed, taken from http://jsfiddle.net/7sgd07bz/
  var _table = $('#correspondence_table'),
    _bodyCells = _table.find('tbody tr:first').children(),
    _headCells = _table.find('thead tr:first').children(),
    colWidthB,colWidthH,
    h_width, b_width;

  // Get the tbody columns width array
  colWidthB = _bodyCells.map(function() {
      return $(this).width();
  }).get();
  colWidthH = _headCells.map(function() {
    return $(this).width();
  }).get();

  var new_width = [];
  for(var i=0;i<colWidthB.length;i++)
  {
    if(colWidthH[i] >= colWidthB[i])
    {
      new_width.push(colWidthH[i]);
    }
    else
    {
      new_width.push(colWidthB[i]);
    }
  }

  //alert(colWidthB[2]+' '+colWidthH[2]+' '+new_width[2]);
  
  // Set the width of thead columns
  _table.find('tbody tr').children().each(function(i, v) {
    $(v).width(new_width[i]);
  }); //css('width',new_width[i]+'px');});
  // Get the tbody columns width array
  //colWidthB = _bodyCells.map(function() {
  //    return $(this).width();
  //}).get();
  _table.find('thead tr').children().each(function(i, v) {
    $(v).width(new_width[i]);
  });

  $('#correspondence_table tbody').height(COVI.settings['cth']);
  
  try
  {
    $('#correspondence_data').perfectScrollbar({suppressScrollY:true}).update();
    $('#correspondence_table_body').perfectScrollbar().update();
  }
  catch(e)
  {
    $('#correspondence_data').perfectScrollbar({suppressScrollY:true});
    $('#correspondence_table_body').perfectScrollbar();
  }

}

COVI.collapseCognates = function (elm)
{
  var trs = document.getElementsByClassName(elm.id);
  if(elm.dataset['collapsed'] == 'false')
  {
    elm.dataset['collapsed'] = true;
    for(var i=0,tr;tr=trs[i];i++)
    {
      tr.style.display = 'none';
    }
  }
  else
  {
    elm.dataset['collapsed'] = 'false';
    for(var i=0,tr;tr=trs[i];i++)
    {
      tr.style.display = 'table-row';
    }
  }
}

COVI.showOccurrences = function (sound)
{
  var occs = OCCS[sound];
  var tlang = sound.split('.')[0];
  var tsound = sound.split('.')[1];

  var header = '<b>Occurrences of '+plotWord(sound.split('.')[1],'div')+' in '+sound.split('.')[0]+':</b>';
  var txt = '<table id="cognates_table">';
  
  for(var i=0,concept;concept=occs[i];i++)
  {
    txt += '<tbody class="blu"><tr><th id="gloss_'+GlossId[concept]+'" data-collapsed="false" ondblclick="COVI.collapseCognates(this);" class="cognates_table_header" colspan="5"><span class="handlerx">Concept:</span> &quot;'+concept+'&quot;</th></tr>';
    
    /* quick search for cognate words */
    var entries = WLS[concept];
    
    var gcid = '';
    for(var j=0,entry;entry=entries[j];j++)
    {
      if(entry[0] == tlang)
      {
        if(entry[2].indexOf(tsound) != -1)
        {
          gcid = entry[3];
        }
      }
    }
    
    var pcogid = '';
    var pcol = 'white';

    for(var j=0,entry;entry=entries[j];j++)
    {
      var tcogid = entry[3];
      if(COVI.selections.indexOf(entry[0]) != -1)
      {
      
        /* check for previously differing cogid */
        if(tcogid != pcogid)
        {
          pcogid = tcogid;
          if(pcol == 'white')
          {
            pcol = 'lightgray';
          }
          else
          {
            pcol = 'white';
          }
        }
        if(gcid == tcogid)
        {
          txt += '<tr class="gloss_'+GlossId[concept]+'" style="background-color:LightBlue">';
        }
        else
        {
          txt += '<tr class="gloss_'+GlossId[concept]+'" style="background-color:'+pcol+'">';
        }
        txt += '<td>'+entry[1]+'</td>'; // id
        txt += '<td>'+entry[0]+'</td>'; // language
        txt += '<td>'+entry[2]+'</td>'; // ipa
        txt += '<td>'+entry[3]+'</td>'; // cogid
        txt += '<td>'+plotWord(entry[4])+'</td>'; // alignment
        txt += '</tr>';
      }
    }
    txt += '</tbody>';
  }
  
  txt += '</table>';
  
  document.getElementById('cognates_header').innerHTML = header;
  document.getElementById('cognates_data').innerHTML = txt;

  $('#cognates_table').sortable({
    group: '.blu',
    handle: '.handlerx',
    start: function( event, ui ) {      
      clone = $(ui.item[0].outerHTML).clone();},
    placeholder: {
      element: function(clone, ui) {
        return $('<tbody class="selected" style="opacity:0.2;">'+clone[0].innerHTML+'</tbody>');},
    update: function() {
      return;}}
   });
  
  $('.sortables').addClass('ui-helper-clearfix');
  $('#cognates_data').perfectScrollbar();
}

COVI.createSelector = function()
{
  var tmp_selections = [];
  var txt = '<select class="selectpicker" style="height:200px;width:200px;" id="selectorix" multiple>';
  var counter = 1;
  for(var i=0,lang;lang=LANGS[i];i++)
  {
    if(counter < 8)
    {
      tmp_selections.push(lang);
      txt += '<option value="'+lang+'" selected>'+lang+'</option>';
    }
    else
    {
      txt += '<option value="'+lang+'">'+lang+'</option>';
    }
    counter += 1;

  }
  txt += '</select><br>';
  txt += '<input type="button" onclick="COVI.resetSelection()" value="RESET SELECTION" />';
  document.getElementById('selector_data').innerHTML = txt;
  COVI.selections = tmp_selections;
}

COVI.resetSelection = function()
{
  var selector = document.getElementById('selectorix');
  var new_selections = [];
  for(var i=0,option;option=selector.options[i];i++)
  {
    if(option.selected)
    {
      new_selections.push(option.value);
    }
  }
  COVI.selections = new_selections;
  COVI.showCorrs(new_selections[0]);
  var trs = document.getElementsByClassName('correspondence_row')[0];
  COVI.showOccurrences(trs.id.split('_')[1]);
}

/* start application */
COVI.createSelector();
COVI.showCorrs(LANGS[0]);
var trs = document.getElementsByClassName('correspondence_row')[0];
COVI.showOccurrences(trs.id.split('_')[1]);
  $('#correspondence_data').perfectScrollbar({suppressScrollY:true});
  $('#correspondence_table_body').perfectScrollbar();


/* function resizes data upon change of window-height */
$(document).ready(function(){
  function setHeight()
  {
    var cur_height = window.innerHeight;
    var cur_width = window.innerWidth;

    var cor_height = cur_height - 150;
    var cor_width = cur_width * 0.5;
    var cog_width = cur_width * 0.4;

    $('#correspondence_table tbody').css("height",cor_height+'px');
    $('#correspondence_data').css('max-width',cor_width+'px');
    
    
    var cog_height = document.getElementById('correspondence_data').offsetHeight; /* check this, it sounds strange */
    
    $('#cognates_data').css('height',cog_height+'px');
    $('#cognates_data').css('max-width',cog_width+'px');
    COVI.settings['cth'] = cor_height;
  $('#correspondence_table_body').perfectScrollbar();
  $('#correspondence_data').perfectScrollbar({suppressScrollY:true});


  }
  $(window).on('resize', function(){setHeight()});
  setHeight();
});

$('#handles').sortable({
  handle: '.handle',
  start: function( event, ui ) {      
    clone = $(ui.item[0].outerHTML).clone();},
  placeholder: {
    element: function(clone, ui) {
      return $('<div class="selected" style="opacity:0.2;">'+clone[0].innerHTML+'</div>');},
  update: function() {
    return;}}
  });

