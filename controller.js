angular.module('generatorApp')
.controller('generatorController', ['$scope', '$location', '$timeout', 'GeneratorService',
function($scope, $location, $timeout, GeneratorService) {

  $scope.p = {inputText: ''};
  $scope.generatedMml = "なし";


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


  $scope.generate = function() {
    $timeout(function() { // compileより前にする(compileがSIOPMロード失敗の為にundefinedでexceptionになっても、先にURLへの反映はしておく)
      setParamsToUrlFromScope();
    }, 0);

    $scope.generatedMml = $scope.inputText;
    SIOPM.compile($scope.generatedMml);
  };




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

  SIOPM.initialize(); // [前提] SIOPMのプロパティへ各functionを代入し終わっていること
  $timeout(function() {
    setParamsToScopeFromUrl(); // [前提] $scopeのプロパティへ各functionを代入し終わっていること
  }, 0);


}]);
