var search, results, allOptions, currentSet = [];
var lastUpdate = "?";

//var indexOnDescriptionCheckbox = document.getElementById('indexOnDescriptionCheckbox');
//var indexOnTitleCheckbox = document.getElementById('indexOnTitleCheckbox');

//var modalTitle = document.getElementById('myModalLabel');
//var modalBody = document.getElementById('myModalBody');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchOptions();
};

var searchEnter = function() {
  event.preventDefault();

  console.log(window.location.href);
  if(searchInput.value !== ""){

    newurl = window.location.href.split('?')[0]+"?"+searchInput.value.trim();
    console.log(newurl);

    window.location.href = encodeURI(newurl);

  }
}

var docOnload = function(){
  var queryString = "";
  if(window.location.href.includes("?")){
    queryString = decodeURI(window.location.href.split('?')[1]);
    searchInput.value = queryString;
  }

  if(queryString !== ""){
    searchOptions();
  }
}

//indexOnDescriptionCheckbox.onchange = rebuildAndRerunSearch;
//indexOnTitleCheckbox.onchange = rebuildAndRerunSearch;
//indexStrategySelect.onchange = rebuildAndRerunSearch;

var rebuildSearchIndex = function() {
  search = new JsSearch.Search('description');
  search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
  search.searchIndex = new JsSearch.UnorderedSearchIndex();
  search.addIndex('pname');
  search.addIndex('description');
  search.addIndex('repo');
  search.addDocuments(allOptions);
};

var indexedOptionsTable = document.getElementById('indexedOptionsTable');
var lastUpdateElement = document.getElementById('lastUpdateElement');
var indexedOptionsTBody = indexedOptionsTable.tBodies[0];
var searchInput = document.getElementById('searchInput');
var optionCountBadge = document.getElementById('optionCountBadge');

var updateLastUpdate = function(lastUpdate) {
  lastUpdateElement.innerHTML = 'Last update: '+ lastUpdate;
};

var updateOptionsTable = function(options) {
  indexedOptionsTBody.innerHTML = '';
  currentSet = options;

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = options.length; i < length; i++) {
    var option = options[i];

    var nameColumn = document.createElement('td');
    if(option.homepage!==""){

    nameColumn.innerHTML = "<a href='"+option.homepage+"'>"+ option.name+ "</a>";
    }
    else{
    nameColumn.innerHTML = option.pname;

    }

    var attributeColumn = document.createElement('td');
    attributeColumn.innerHTML = "<a href='"+option.position+"'>"+ option.attribute+ "</a>";

    var descriptionColumn = document.createElement('td');
    descriptionColumn.innerHTML = option.description;

    var repoColumn = document.createElement('td');
    repoColumn.innerHTML = "<a href='/repos/"+option.repo.toLowerCase()+"'>"+ option.repo+ "</a>";

    var tableRow = document.createElement('tr');

    var att1 = document.createAttribute("style");
    att1.value = "overflow-wrap: break-word";
    var att2 = document.createAttribute("style");
    att2.value = "overflow-wrap: break-word";
    nameColumn.setAttributeNode(att1);
    attributeColumn.setAttributeNode(att2);

    tableRow.appendChild(nameColumn);
    tableRow.appendChild(attributeColumn);
    tableRow.appendChild(descriptionColumn);
    tableRow.appendChild(repoColumn);

    indexedOptionsTBody.appendChild(tableRow);
  }
};

var expandOption = function(el){

  modalTitle.innerHTML = currentSet[el].title;

  var elDesc = "<h5 style='margin:1em 0 0 0'>Description</h5><div>" + currentSet[el].description + "</div>";
  var elType = "<h5 style='margin:1em 0 0 0'>Type</h5><div>" + currentSet[el].type + "</div>";
  var elNote = ( currentSet[el].note == "" ? "": "<h5 style='margin:1em 0 0 0'>Type</h5><div>" + currentSet[el].note + "</div>");
  var elDefault = "<h5 style='margin:1em 0 0 0'>Default</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].default + "</pre></div>";
  var elExample = ( currentSet[el].example == "" ? "" : "<h5 style='margin:1em 0 0 0'>Example</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].example + "</pre></div>");

  var declared_by_str = String(currentSet[el].declared_by).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');

  var elDeclaredBy = "<h5 style='margin:1em 0 0 0'>Declared by</h5><div>" + declared_by_str+ "</div>";
  modalBody.innerHTML = elDesc + elNote + elType + elDefault + elExample + elDeclaredBy;


  $('#myModal').modal('show')
}

var updateOptionCountAndTable = function() {
  updateOptionCount(results.length);

  if (results.length > 0) {
    updateOptionsTable(results);
  } else if (!!searchInput.value) {
    updateOptionsTable([]);
  } else {
    updateOptionCount(allOptions.length);
    updateOptionsTable(allOptions);
  }
};

var searchOptions = function() {
  results = search.search(searchInput.value);
  updateOptionCountAndTable();
};

searchInput.oninput = searchOptions;

var updateOptionCount = function(numOptions) {
  optionCountBadge.innerText = numOptions + ' options';
};
var hideElement  = function(element) {
  element.className += ' hidden';
};
var showElement = function(element) {
  element.className = element.className.replace(/\s*hidden/, '');
};

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var json = JSON.parse(xmlhttp.responseText);

    allOptions = json.index;
    lastUpdate = json.last_update;
    updateLastUpdate(lastUpdate);

    updateOptionCount(allOptions.length);

    var loadingProgressBar = document.getElementById('loadingProgressBar');
    hideElement(loadingProgressBar);
    showElement(indexedOptionsTable);

    rebuildSearchIndex();
    docOnload();
    if(searchInput.value.trim() ==""){
      updateOptionsTable(allOptions);
    }


  }
}
xmlhttp.open('GET', '/search_index.json', true);
xmlhttp.send();
