app.controller("playerSearchController", function ($scope, $http, $rootScope, $location) {

    $scope.playerSearch = function (textToSearch) {
        $rootScope.matches =  startSearch("/DB/DBimposter.txt",textToSearch);
    }

    $scope.selectPlayer = function(player) {
        $rootScope.matches = [];
        $location.url("/playerCard/"+player.id);
    }

});

function startSearch(file,textToSearch) {
    var request = new XMLHttpRequest();
    request.open("GET", file, false);
    request.send(null);

    if(request.status === 200) {
        var allText = request.responseText;
        var players = JSON.parse(allText);
        return search(players,textToSearch);
    }else{
        return null;
    }
}

function search(players,textToSearch) {
    var matches = [];
    for (let i = 0; i < players.length; i++) {
        if(players[i].person.fullName.toUpperCase().includes(textToSearch.toUpperCase()))
        {
            matches.push({
                name: players[i].person.fullName,
                number: players[i].jerseyNumber,
                position: players[i].position.name,
                id: players[i].person.id
            })
        }
    }
    return matches;
}