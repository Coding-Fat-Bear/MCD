define([
  "./properties",
  "./initialproperties",
  "text!./template.ng.html",
  "qlik",
], function (props, initProps, ngTemplate, qlik) {
  "use strict";

  return ({
    definition: props,
    initialProperties: initProps,
    support: { snapshot: true },
    template: ngTemplate,

    controller: [
      "$scope",
      function ($scope) {
        console.log($scope.layout.props.isPubOutput);
        let app = qlik.currApp(this);
        let variableName = "myPersistentVariablebooktest";

        $scope.getBasePath = function () {
          var prefix = window.location.pathname.substr(
              0,
              window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1
            ),
            url = window.location.href;
          return (
            (url = url.split("/")),
            url[0] +
              "//" +
              url[2] +
              ("/" === prefix[prefix.length - 1]
                ? prefix.substr(0, prefix.length - 1)
                : prefix)
          );
        };

        $scope.objIdList = [];
        $scope.selectedList = [];
        $scope.mcdID;
        $scope.rep;
        $scope.height;
        app.getAppObjectList("sheet", async function (reply) {
          try {
            await app.variable.getByName(variableName).then(function (reply) {
              if (reply) {
                console.log("already variable created");
              } else {
              }
            });
          } catch (error) {
            console.log("line69" + JSON.stringify(error));
            console.log("created");
            app.variable.create({
              qName: variableName,
              qDefinition: 0,
              qIncludeInBookmark: true,
            });
          }

          try {
            await app.variable.getContent(variableName, function (reply) {
              $scope.rep = reply;
              $scope.selectedList = JSON.parse(reply.qContent.qString);
            });
          } catch (error) {
            console.log("line81" + JSON.stringify(error));
          }

          $scope.objIdList.length = 0;
          reply.qAppObjectList.qItems.forEach((Items) => {
            var hasProperty = Items.qMeta.hasOwnProperty("published");
            if (hasProperty) {
              var setPub = Items.qMeta.published;
            }
            Items.qData.cells.forEach((element) => {
              element.sheetname = Items.qMeta.title;
              if (element.type !== "MCD" ) {
                if (hasProperty) {
                  element.published = setPub;
                  $scope.objIdList.push(element);
                }
                else{
                  element.published = false;
                  $scope.objIdList.push(element);
                }
              } else {
                $scope.mcdID = element.name;
              }
            });
            ////////testing
            // Items.qData.cells.forEach((element) => {
            //   if (element.type !== "MCD" ) {
            //     if (hasProperty) {
            //       element.published = setPub;
            //       $scope.objIdList.push(element);
            //     }
            //     else{
            //       element.published = false;
            //       $scope.objIdList.push(element);
            //     }
            //   } else {
            //     $scope.mcdID = element.name;
            //   }
            // });
            ////////testing
          }
          );
          $scope.getObjlist = async function () {
            for (let i = 0; i < $scope.objIdList.length; i++) {
              await app
                .getObjectProperties($scope.objIdList[i].name)
                .then(function (model) {
                  if (model.properties.title.length < 1) {
                    $scope.objIdList[i].title =
                      "No Title -" + $scope.objIdList[i].name+"-"+$scope.objIdList[i].type;
                    $scope.objIdList[i].selected = false;
                  } else {
                    $scope.objIdList[i].title = model.properties.title;
                    $scope.objIdList[i].selected = false;
                  }
                });
            }

            for (let i = 0; i < $scope.objIdList.length; i++) {
              const idToCheck = $scope.objIdList[i].name;
              for (let j = 0; j < $scope.selectedList.length; j++) {
                if ($scope.selectedList[j].name == idToCheck) {
                  $scope.objIdList[i].selected =
                    $scope.selectedList[j].selected;
                  break;
                } else {
                  $scope.objIdList[i].selected = false;
                }
              }
            }
            if($scope.layout.props.isPubOutput){
              $scope.objIdList = $scope.objIdList.filter(function(element) {
                return element.published !== false;
              });
            }
            if($scope.layout.props.isTabOutput){
              $scope.objIdList = $scope.objIdList.filter(function(element) {
                return element.type === 'table' || element.type === 'pivot-table';
              }
              );
            }
          };
           $scope.getObjlist()
        });
        $scope.export = function () {
          var selectedObjects = $scope.objIdList.filter(function (item) {
            return item.selected;
          });
          selectedObjects.forEach(function (object) {
            app.getObject(object.name).then((model) => {
              model
                .exportData(
                  "OOXML",
                  "/qHyperCubeDef",
                  object.title + " " + object.name
                )
                .then(function (retVal) {
                  var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl;
                  var link = $scope.getBasePath() + qUrl;
                  window.open(link);
                })
                .catch(function (err) {
                  console.log(err);
                })
                .finally(function () {
                  console.log("exported");
                });
            });
          });
        };
        $scope.selectAll = function () {
          $scope.objIdList.forEach(function (result) {
            result.selected = true;
          });
          $scope.store();
        };
        $scope.unselectAll = function () {
          $scope.objIdList.forEach(function (result) {
            result.selected = false;
          });
          $scope.store();
        };
        $scope.store = function () {
          $scope.selectedList = $scope.objIdList;
          var selectedListString = JSON.stringify($scope.selectedList);
          app.variable.setStringValue(variableName, selectedListString);
          console.log("stored" + selectedListString);
        };

        $scope.show = async function () {
          // console.log($scope.rep.qContent.qString);
          // console.log($scope.objIdList.length);
          // if ($scope.objIdList.length < 10) {
          //   $scope.height = 100 + "px";
          // } else {
          //   $scope.height = 200 + "px";
          // }
          // await app.variable.getContent(variableName, function (reply) {
          //   $scope.selectedList = JSON.parse(reply.qContent.qString);
          // });
        };
      },
    ],
});
});
