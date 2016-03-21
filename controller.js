angular.module('generatorApp')
.controller('generatorController', ['$scope', '$location', '$timeout', 'GeneratorService',
function($scope, $location, $timeout, GeneratorService) {

  $scope.p = {inputText: ''};
  $scope.generatedMml = "なし";
  $scope.mmlFormat = "sion";


  // URLから取得 [用途] URLだけでMMLを受け取れるようにする
  function setParamsToScopeFromUrl() {
    var p = getDecompressedParamsFromUrl();
    if (p) {
      $scope.p = p;
    }
  }
  // URLに反映 [用途] 書いたMMLをURLコピペで共有できるようにする
  function setParamsToUrlFromScope() {
    $location.search({
      p: getCompressedParamsForUrl()
    });
  }
  // [イメージ] $scope.p「aaa」→ URL「～/#?p=bbb」(bbbはlzbase62エンコードされた文字列)
  function getCompressedParamsForUrl() {
    return lzbase62.compress(JSON.stringify($scope.p));
  }
  // [イメージ] URL「～/#?p=bbb」(bbbはlzbase62エンコードされた文字列) → $scope.p
  function getDecompressedParamsFromUrl() {
    var paramFromUrl = $location.search().p;
    if (!paramFromUrl) return undefined;
    return JSON.parse(lzbase62.decompress(paramFromUrl));
  }
  
  $scope.openTweet = function() {
    var twUrl = "https://twitter.com/intent/tweet?";
    var prms = "";
    prms += "hashtags=" + "sionmml";
    prms += "&text=" +
      encodeURIComponent("♪" + $scope.p.inputText.substr(0, 50) + "♪ " +
        window.location.href
      );
    window.open(twUrl + prms, "", "scrollbars=yes,width=500,height=300");
  };
  
  $scope.generate = function() {
    $timeout(function() { // compileより前にする(compileがSIOPMロード失敗の為にundefinedでexceptionになっても、先にURLへの反映はしておく)
      setParamsToUrlFromScope();
    }, 0);

    $scope.generatedMml = $scope.p.inputText;

    switch($scope.mmlFormat){
      case "sion" :
        SIOPM.stop();
        SIOPM.compile($scope.generatedMml);
        break;
      case "sionic" :
        Pico.pause();
        Pico.play(Sionic($scope.generatedMml));
        break;
      default: 
        console.error("Unsupported format");
    }
    
  };


  $scope.reverseOctave = function() {
    $scope.p.inputText = GeneratorService.reverseOctave($scope.p.inputText);
    $scope.generate();
  }

  SIOPM.onLoad = function() {
    if (angular.isString($scope.p.inputText)) {
      $timeout(function() {
        $scope.generate();
      }, 0);
    }
  };

  SIOPM.onCompileComplete = function() {
    SIOPM.play();
  };

  try{
    SIOPM.initialize(); // [前提] SIOPMのプロパティへ各functionを代入し終わっていること
  }catch(e){
    //fallback
    $scope.mmlFormat = "sionic";
  }
  $timeout(function() {
    setParamsToScopeFromUrl(); // [前提] $scopeのプロパティへ各functionを代入し終わっていること
    if($scope.mmlFormat === "sionic"){
      $scope.generate();
    }
  }, 0);


}]);
