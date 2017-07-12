let MOVIE = 'MOVIE', SERIES = 'SERIES', NOTHING = 'NOTHING';

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    //console.log(msg);
    // If the received message has the expected format...
    if (msg.text === 'scrape_page') {

      //Detect page type
      var type = getPageType(window.location.href, location.search);
      //console.log(type);

      switch (type) {
        case MOVIE:
            var result = scrapeSite(document.body, type);
            sendResponse({type: type, result: result});
          break;

        case SERIES:
          //Get info from page
          var result = scrapeSite(document.body, type);

          //Send response
          sendResponse({type: type, result: result});

        default:
          sendResponse({type: NOTHING});
          break;
      }

    }

    if(msg.text === 'get_post_url'){
      let action = document.getElementById('subform').getAttribute('action');
      console.log(action);
      sendResponse({postUrl: action});
    }

    if(msg.text === 'redirect'){
      let url = window.location.href;
      if(url.indexOf('&c=') != -1){
        //need to remove the old subtitles first
        url = url.substring(0, url.indexOf('&c='));
      }
      url = url + '&' + msg.suffix;

      window.location.href = url

    }
    return true;
});

function scrapeSite(doc, type){

  if(type == NOTHING) return;

  var div = doc
    .getElementsByTagName('table')[0]
    //.getElementsByTagName('tr')[1]
    .getElementsByTagName('div')[4]
    .getElementsByTagName('div')[2];

  if(type == MOVIE){
    let title = decodeHtml(div.innerHTML.trim());
    title = title.substring(0,title.indexOf('(')).trim();
    return {
      title: title
    }
  } else {
    //series
    var title = div.getElementsByTagName('a')[0]
      .innerHTML;

    //Find the parantheses
    var open = div.innerHTML.lastIndexOf('(');
    var close = div.innerHTML.lastIndexOf(')');

    //unwrap selector and get numbers
    var selector = div.innerHTML.substring(open+1, close);
    var x = selector.indexOf('x');
    var season = parseInt(selector.substring(0,x));
    var episode = parseInt(selector.substring(x+1, selector.length));

    return {
      title: decodeHtml(title),
      season: season,
      episode: episode
    }
  }


}

function getPageType(url, params){
  //Clean href of params
  var url = url.substring(0, url.length - params.length);

  if(url.indexOf('episodes.php') != -1){
    // Not a page with page select
    return NOTHING;
  }

  if(url.endsWith('.com/')){
    //we're definitely in some kind of series or movies

    if(params.indexOf('tv=') != -1){
      // tv is present, it is a series
      return SERIES;

    }
    return MOVIE;

  }
  console.log('Type of page is not defined.');
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
