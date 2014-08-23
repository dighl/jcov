/* Correspondence Viewer for LingPy Cognate Judgments
 *
 * author   : Johann-Mattis List
 * email    : mattis.list@lingulist.de
 * created  : 2014-08-20 11:51
 * modified : 2014-08-20 11:51
 *
 */

/* we store namespaces of this app as JCOV */
var JCOV = {};

/* store sorting options */
JCOV.SORTED = {};
JCOV.selections = [];

JCOV.settings = {};
JCOV.settings['correspondences'] = true;
JCOV.settings['cognates'] = true;


JCOV.getCorrs = function (event)
{
  if(event.keyCode != 13)
  {
    return;
  }
  var corrs = document.getElementById('language_selector');
  var this_lang = corrs.value;
  
  JCOV.showCorrs(this_lang);
}

JCOV.togglePanel = function(elm)
{
  $('#'+elm).toggleClass('invisible');
  var tmp = document.getElementById(elm+'_toggle');
  if(tmp.innerHTML.indexOf('glyphicon-ok') != -1)
  {
    tmp.innerHTML = tmp.innerHTML.replace('glyphicon-ok','glyphicon-remove');
    JCOV.settings[elm] = false;
  }
  else
  {
    tmp.innerHTML = tmp.innerHTML.replace('glyphicon-remove','glyphicon-ok');
    JCOV.settings[elm] = true;
  }

  JCOV.setHeight();
}

JCOV.showCorrs = function (this_lang)
{
  JCOV.settings['current_language'] = this_lang;

  /* just write the simple header notice to this part */
  var source = document.getElementById('correspondence_header');
  var header = '<span class="handle glyphicon glyphicon-move "></span> ';
  header += 'Frequent Sound Correspondences of '+this_lang+":";
  header += '<span onclick="JCOV.togglePanel(\'correspondences\');" class="pointed glyphicon glyphicon-remove pull-right"></span>';
  source.innerHTML = header;
  
  /* check for sorted stuff */
  if(this_lang in JCOV.SORTED)
  {
    var keys = JCOV.SORTED[this_lang];
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
    JCOV.SORTED[lines[0].dataset['value'].split('.')[0]] = tmp;
  }  

  var olangs = [];
  for(var i=0;i<LANGS.length;i++)
  {
    if(this_lang != LANGS[i] && JCOV.selections.indexOf(LANGS[i]) != -1)
    {
      olangs.push(LANGS[i]);
    }
  }
  olangs.sort();

  var header = '<thead>';
  header += '<tr><th class="source">NUMBER</th><th class="source">SOUND</th><th class="source">CONTEXT</th>';
  for(var i=0,olang;olang=olangs[i];i++)
  {
    header += '<th class="targets pointed" onclick="JCOV.showCorrs(\''+olang+'\')">'+olang+'</th>';
  }
  header += '</tr></thead>';
  
  var txt = '<table id="correspondence_table">'+header;
  txt += '<tbody>';
  
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
    txt += '<tr class="correspondence_row" id="tr_'+key+'"><td data-value="'+key+'" class="ctab_numbers source" id="cnum_'+counter+'">'+counter+'</td><td class="source pointed" onclick="JCOV.showOccurrences(\''+key+'\')">'+plotWord(this_sound)+'</td><td class="source">'+this_context+'</td><td>'+tbl.join('</td><td>')+'</td></tr>';
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
  
  /* initialize correspondence table as fixed-header-table */
  $('#correspondence_table').fixedHeaderTable({ 
  });
  //$('.fht-fixed-body').css('visibility','hidden');
}

JCOV.collapseCognates = function (elm)
{
  var trs = document.getElementsByClassName(elm.id);
  if(elm.dataset['collapsed'] == 'false')
  {
    /* note that we store the elements width here in order to
     * guarantee that the element's width won't change too much 
     * if all items in the table are collapsed 
     */
    var width = $(elm).width(); //offsetWidth;
    elm.dataset['collapsed'] = true;
    for(var i=0,tr;tr=trs[i];i++)
    {
      tr.style.display = 'none';
    }
    elm.innerHTML = elm.innerHTML.replace('collapse-down','collapse-up');
    var nwidth = $(elm).width();
    if(width > nwidth+10)
    {
      $(elm).width(width); /* somehow, offset width is too much, 
                              one needs to reduce it here in order to 
                              make super-smooth toggling in ff, but it
                              won't crush the size, so I leave it as is */
    }
  }
  else
  {
    elm.dataset['collapsed'] = 'false';
    for(var i=0,tr;tr=trs[i];i++)
    {
      tr.style.display = 'table-row';
    }
    elm.innerHTML = elm.innerHTML.replace('collapse-up','collapse-down');
  }
}

JCOV.showOccurrences = function (sound)
{
  var occs = OCCS[sound];

  /* get all three values*/
  var tmp = sound.split('.');
  var tlang = tmp[0];
  var tsound = tmp[1];
  var tcontext = tmp[2];
  
  var header = '<span class="glyphicon glyphicon-move handle"></span> ';
  if(occs.length == 1)
  {
    header += tlang+' '+plotWord(sound.split('.')[1],'div')+ '/'+tcontext+' occurs in '+occs.length+' concept:';
  }
  else
  {
    header += tlang+' '+plotWord(sound.split('.')[1],'div')+ '/'+tcontext+' occurs in '+occs.length+' concepts:';
  }
  header += '<span onclick="JCOV.togglePanel(\'cognates\');" class="glyphicon glyphicon-remove pull-right pointed"></span>';
  
  var txt = '<table id="cognates_table">';
  
  for(var i=0,concept;concept=occs[i];i++)
  {
    txt += '<tbody class="blu"><tr><th id="gloss_'+GlossId[concept]+'" data-collapsed="false" ondblclick="JCOV.collapseCognates(this);" class="cognates_table_header" colspan="5">&quot;'+concept+'&quot;';
    txt += '<span class="glyphicon glyphicon-collapse-down pull-right" onclick="JCOV.collapseCognates(this.parentNode)"></span>';
    txt += '<span class="handlerx glyphicon glyphicon-move pull-left"></span> '; 
    txt += '</th></tr>';
    
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
      if(JCOV.selections.indexOf(entry[0]) != -1)
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
        txt += '<td style="cursor:pointer" title="show sound correspondences for this doculect" onclick="JCOV.showCorrs(\''+entry[0]+'\');">'+entry[0]+'</td>'; // language
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
}

JCOV.createSelector = function()
{
  var tmp_selections = [];
  var txt = '<select class="multiselect" id="selectorix" multiple>';
  var counter = 1;
  for(var i=0,lang;lang=LANGS[i];i++)
  {
    if(counter < 7)
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
  txt += '</select>';
  document.getElementById('selector_data').innerHTML = txt;
  
  $('.multiselect').multiselect({
    selectAll:true,
    enableFiltering:true,
    maxHeight: window.innerHeight-150, /* change later to cog_height */
    buttonClass: 'btn-link',
    includeSelectAllOption: true,
    enableCaseInsensitiveFiltering: true,
      buttonContainer: '<div style="display:inline" />',
      buttonText: function(options,select){return 'Select Doculects <b class="caret"></b>';}
  }); 
  $('.multiselect-container')
    .css('overflow-y','auto')
    .css('padding',"15px");
  
  JCOV.selections = tmp_selections;
}

JCOV.resetSelection = function()
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
  JCOV.selections = new_selections;
  JCOV.showCorrs(new_selections[0]);
  
  /* bad hack, but for the moment, I'm too lazy to enhance it */
  var trs = document.getElementsByClassName('correspondence_row')[0];
  JCOV.showOccurrences(trs.id.split('_')[1]);
}


JCOV.setHeight = function()
{
  var cur_height = window.innerHeight;
  var cur_width = window.innerWidth;

  var cor_height = cur_height - 180;
  
  if(JCOV.settings['correspondences'] && JCOV.settings['cognates'])
  {
    var cor_width = cur_width * 0.5;
    var cog_width = cur_width * 0.45;
  }
  else if(JCOV.settings['correspondences'])
  {
    var cor_width = cur_width * 0.9;
    var cog_width = cur_width * 0.45;
  }
  else
  {
    var cor_width = cur_width * 0.9;
    var cog_width = cur_width * 0.9;
  }

  $('#correspondence_data').css('max-width',cor_width+'px');
  $('#correspondence_data').css("height",cor_height+'px');
  
  
  if(JCOV.settings['correspondences'])
  {
    var cog_height = document.getElementById('correspondence_data').offsetHeight; /* check this, it sounds strange */
  }
  else
  {
    var cog_height = cor_height;
  }
  
  $('#cognates_data').css('height',cog_height+'px');
  $('#cognates_data').css('max-width',cog_width+'px');
  
  JCOV.settings['cth'] = cor_height;

  /* resize the multi-selector */
  $('.multiselect-container').css('max-height',cur_height-100); 

  JCOV.showCorrs(JCOV.settings['current_language']);
}

/* function resizes data upon change of window-height */
$(document).ready(function(){
  function setHeight()
  {
    JCOV.setHeight();
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



JCOV.init = function()
{
  /* start application */
  JCOV.createSelector();
  JCOV.showCorrs(LANGS[0]);
  var trs = document.getElementsByClassName('correspondence_row')[0];
  JCOV.showOccurrences(trs.id.split('_')[1]);
    //$('#correspondence_data').perfectScrollbar({suppressScrollY:true});
    //$('#correspondence_table_body').perfectScrollbar();
}

JCOV.init();
