(function(karma, window) {
  
// character map based on clojure.lang.Compiler/CHAR_MAP
var charMap = {
  '-': "_", 
  ':': "_COLON_", 
  '+': "_PLUS_", 
  '>': "_GT_", 
  '<': "_LT_", 
  '=': "_EQ_", 
  '~': "_TILDE_", 
  '!': "_BANG_", 
  '@': "_CIRCA_", 
  '#': "_SHARP_", 
  '\'': "_SINGLEQUOTE_", 
  '"': "_DOUBLEQUOTE_", 
  '%': "_PERCENT_", 
  '^': "_CARET_", 
  '&': "_AMPERSAND_", 
  '*': "_STAR_", 
  '|': "_BAR_", 
  '{': "_LBRACE_", 
  '}': "_RBRACE_", 
  '[': "_LBRACK_", 
  ']': "_RBRACK_", 
  '/': "_SLASH_", 
  '\\': "_BSLASH_", 
  '?': "_QMARK_"
};

var reEscape = function (re) {
  return re.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');    
}

var charRE = new RegExp("[" + Object.keys(charMap).map(reEscape).join('') + "]", "g")

var munge = function (str) {
  return str.replace(charRE, function (char) {
    return charMap[char];
  });
}
 
var createClojureScriptTest = function (tc, runnerPassedIn) {
    var clientConfig = tc.config &&
                       tc.config.cljsTest;
    var karmaNS = clientConfig &&
                  clientConfig.main;
  
    var karmaFn;
    var entryPoint; 
   
    if (karmaNS) {
      karmaFn = Function('entryFn', 'return window.' + munge(karmaNS) + '[' + 'entryFn' + ']');
      entryPoint = (clientConfig.entry &&
                    munge(clientConfig.entry)) ||
                   'run';
    } else {
      // TODO: Throw error if the user hasn't configured a main namespace.
    }

    return function () {
      var startFn = karmaFn(entryPoint);
      
      if (startFn) {
        startFn(tc);
      } else {
        // TODO: Throw error if we can't find the runner entry point.
      }
    };
};
 
karma.start = createClojureScriptTest(karma);
})(window.__karma__, window);


