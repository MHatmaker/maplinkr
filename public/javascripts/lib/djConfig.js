var dojoConfig = {
    async: true,
    parseOnLoad: false, 
    tlmSiblingOfDojo: true, 
    map: {
        // Instead of having to type "dojo/domReady!", we just want "ready!" instead
        "*": {
            ready: "dojo/domReady"
        }
    } //,
    // baseUrl:  "//ajax.googleapis.com/ajax/libs/dojo/1.9.3/" 
    };