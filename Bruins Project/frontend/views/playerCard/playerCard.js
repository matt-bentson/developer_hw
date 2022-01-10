var playerInfo;
var currentChart;

var activeButton = "btn btn-primary";
var disabledButton = "btn btn-secondary";

var chartActiveButton = "btn btn-sm btn-info"
var chartDisabledButton = "btn btn-sm btn-secondary"

app.controller("playerCardController", function ($scope, $http, $rootScope, $location, $routeParams) {

    $rootScope.careerButtonClass = disabledButton;
    $rootScope.careerButtonDisableFlag = true;
    $rootScope.chartButtonClass = activeButton;
    $rootScope.chartButtonDisableFlag = false;
    $rootScope.logButtonClass = activeButton;
    $rootScope.logButtonDisableFlag = false;
    $rootScope.showCareerStats = true;
    $rootScope.showChart = false;
    $rootScope.showGameLog = false;

    $rootScope.totalChartButtonClass = chartDisabledButton;
    $rootScope.totalChartButtonDisableFlag = true;
    $rootScope.evPer60ChartButtonClass = chartActiveButton;
    $rootScope.evPer60ChartButtonDisableFlag = false;

    $http({
        method: 'GET',
        url: 'http://127.0.0.1:5000/players/'+$routeParams.id
    }).then(function (response){
        playerInfo = {
            info: {},
            stats: {},
            games: {}
        };
        
        playerInfo.info = setPlayerInfo(response.data);
        
        $http({
            method: 'GET',
            url: 'http://127.0.0.1:5000/players/'+$routeParams.id+'/allStats'
        }).then(function (response){
            playerInfo.stats = setPlayerStats(response.data[0],playerInfo.info.position);
            
            if(playerInfo.info.position == 'G') {
                $rootScope.isSkater = false;
            }else{
                $rootScope.isSkater = true;
            }

            $http({
                method: 'GET',
                url: 'http://127.0.0.1:5000/players/'+$routeParams.id+'/gameLog'
            }).then(function (response){
                playerInfo.games = response.data[0].splits;
                $rootScope.player = playerInfo;
            },function (error){
                console.log(error);
            });
        },function (error){
            console.log(error);
        });
    },function (error){
        console.log(error);
    });

    $scope.goToCareerStats = function() {
        $rootScope.careerButtonClass = disabledButton;
        $rootScope.careerButtonDisableFlag = true;
        $rootScope.chartButtonClass = activeButton;
        $rootScope.chartButtonDisableFlag = false;
        $rootScope.logButtonClass = activeButton;
        $rootScope.logButtonDisableFlag = false;

        $rootScope.showCareerStats = true;
        $rootScope.showChart = false;
        $rootScope.showGameLog = false;
    }

    $scope.goToCharts = function() {
        $rootScope.careerButtonClass = activeButton;
        $rootScope.careerButtonDisableFlag = false;
        $rootScope.chartButtonClass = disabledButton;
        $rootScope.chartButtonDisableFlag = true;
        $rootScope.logButtonClass = activeButton;
        $rootScope.logButtonDisableFlag = false;

        $rootScope.showCareerStats = false;
        $rootScope.showChart = true;
        $rootScope.showGameLog = false;

        $rootScope.totalChartButtonClass = chartDisabledButton;
        $rootScope.totalChartButtonDisableFlag = true;
        $rootScope.evPer60ChartButtonClass = chartActiveButton;
        $rootScope.evPer60ChartButtonDisableFlag = false;

        renderChart("Total");
    }

    $scope.goToGameLog = function() {
        $rootScope.careerButtonClass = activeButton;
        $rootScope.careerButtonDisableFlag = false;
        $rootScope.chartButtonClass = activeButton;
        $rootScope.chartButtonDisableFlag = false;
        $rootScope.logButtonClass = disabledButton;
        $rootScope.logButtonDisableFlag = true;

        $rootScope.showCareerStats = false;
        $rootScope.showChart = false;
        $rootScope.showGameLog = true;
    }

    $scope.goToTotalChart = function() {
        $rootScope.totalChartButtonClass = chartDisabledButton;
        $rootScope.totalChartButtonDisableFlag = true;
        $rootScope.evPer60ChartButtonClass = chartActiveButton;
        $rootScope.evPer60ChartButtonDisableFlag = false;

        renderChart('Total');
    }

    $scope.goToEVPer60Chart = function() {
        $rootScope.totalChartButtonClass = chartActiveButton;
        $rootScope.totalChartButtonDisableFlag = false;
        $rootScope.evPer60ChartButtonClass = chartDisabledButton;
        $rootScope.evPer60ChartButtonDisableFlag = true;

        renderChart('EVPer60');
    }
});

function setPlayerInfo(playerInfo) {
    return {
        name: playerInfo.fullName,
        number: playerInfo.primaryNumber,
        position: playerInfo.primaryPosition.abbreviation,
        height: playerInfo.height,
        weight: playerInfo.weight,
        age: playerInfo.currentAge,
        team: playerInfo.currentTeam.name
    };
}

function setPlayerStats(playerInfo,position) {
    if(position == 'G')
    {
        return setGoalieStats(playerInfo);
    }
    var stats = [];
    var splits = playerInfo.splits;

    for (let i = splits.length - 1; i >= 0 ; i--) {

        if(splits[i].league.id == 133) {
            stats.push({
                season: splits[i].season.substring(0,4)+"-"+splits[i].season.substring(4),
                team: splits[i].team.name,
                goals: splits[i].stat.goals,
                assists: splits[i].stat.assists,
                points: splits[i].stat.points,
                games: splits[i].stat.games,
                faceoffPct: splits[i].stat.faceOffPct,
                shots: splits[i].stat.shots,
                shotPct: splits[i].stat.shotPct,
                timeOnIce: splits[i].stat.timeOnIce,
                evGoalsPer60: evPer60Helper(splits[i].stat.goals,splits[i].stat.powerPlayGoals,splits[i].stat.shortHandedGoals,splits[i].stat.evenTimeOnIce),
                shotsPer60: getShotsPer60(splits[i].stat.shots,splits[i].stat.timeOnIce),
                evPointsPer60: evPer60Helper(splits[i].stat.points,splits[i].stat.powerPlayPoints,splits[i].stat.shortHandedPoints,splits[i].stat.evenTimeOnIce)
            })
        }
    }
    return stats;
}

function evPer60Helper(stat,ppStat,shStat,TOI) {
    stat = parseInt(stat);
    ppStat = parseInt(ppStat);
    shStat = parseInt(shStat);
    TOI = parseFloat(TOI.substring(0,TOI.indexOf(":")+1)) + parseFloat(TOI.substring(TOI.indexOf(":")+1))/60;

    return (((stat-ppStat-shStat)/TOI)*60).toFixed(1);
}

function getShotsPer60(shots,TOI) {
    shots = parseInt(shots);
    TOI = parseFloat(TOI.replace(":","."));

    return ((shots/TOI)*60).toFixed(1);
}

function setGoalieStats(playerInfo) {
    var stats = [];
    var splits = playerInfo.splits;

    for (let i = splits.length - 1; i >= 0 ; i--) {

        if(splits[i].league.id == 133) {
            stats.push({
                season: splits[i].season.substring(0,4)+"-"+splits[i].season.substring(4),
                team: splits[i].team.name,
                gamesPlayed: splits[i].stat.games,
                gamesStarted: splits[i].stat.gamesStarted,
                wins: splits[i].stat.wins,
                losses: splits[i].stat.losses,
                shotsAgainst: splits[i].stat.shotsAgainst,
                goalsAgainst: splits[i].stat.goalsAgainst,
                goalsAgainstAverage: splits[i].stat.goalAgainstAverage.toFixed(2),
                saves: splits[i].stat.saves,
                savePct: splits[i].stat.savePercentage.toFixed(3),
                evSavePct: (splits[i].stat.evenStrengthSavePercentage/100).toFixed(3),
                shutouts: splits[i].stat.shutouts,
            })
        }
    }
    return stats;
}

function renderChart(chartType) {
    var seasons = [];
    var stat1 = [];
    var stat2 = [];
    var label1;
    var label2;

    if(playerInfo.info.position !== 'G') {
        label1 = "Goals";
        label2 = "Points";
        for (let i = playerInfo.stats.length - 1; i >= 0; i--)
        {
            seasons.push(playerInfo.stats[i].season);
            switch(chartType) {
                case "Total":
                    stat1.push(playerInfo.stats[i].goals);
                    stat2.push(playerInfo.stats[i].points);
                    break;
                case "EVPer60":
                    stat1.push(playerInfo.stats[i].evGoalsPer60);
                    stat2.push(playerInfo.stats[i].evPointsPer60);
                    break;
            }
        }
    }else{
        label1 = "Sv%";
        label2 = "EV Sv%";
        for (let i = playerInfo.stats.length - 1; i >= 0; i--)
        {
            seasons.push(playerInfo.stats[i].season);
            stat1.push(playerInfo.stats[i].savePct);
            stat2.push(playerInfo.stats[i].evSavePct);
        }
    }
    

    var chartElement = $('#myChart');
    if(typeof currentChart !== "undefined") {
        currentChart.destroy();
    }
    currentChart = new Chart(chartElement, {
        type: 'line',
        data: {
            labels: seasons,
            datasets: [{
                label: label1,
                data: stat1,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            },{
                label: label2,
                data: stat2,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}