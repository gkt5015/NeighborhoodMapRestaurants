//var current = ko.observable("search something..."); //Better way to do this?
var gmarkers = [];
var map = {};
var info = {}; //Global infowindow variable so that only one infowindow opens
var listViewModel = {
    list : ko.observableArray(),
    currentRest : function(){
        this.current(this.name); //Clicking padding won't activate this
    },
    populateList: function(obj){
        if(this.list != null){
        this.list.removeAll() // Remove current list
        }
        this.list(obj);
    },
    current: ko.observable("search something...")
};
function initMap() {
        var philadelphia = {lat: 39.9526, lng: -75.1652};
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: philadelphia
        });
        //Declare the info object as an InfoWindow object
        info = new google.maps.InfoWindow();

        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);

        //Search Box Selection
        searchBox.addListener('places_changed', function(){
            var places = searchBox.getPlaces();
            if (places.length == 0){
                return;
            }
            else{
                console.log(places);
                setCenter(places, map);
                }
            });
      };

//API Call to Zomato
function zomCall(loc) {
    var lat = loc.lat;
    var lon = loc.lng;
    var url = "https://developers.zomato.com/api/v2.1/search?count=10&sort=real_distance&order=asc&radius=1500&lat="+lat+"&lon="+lon;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            console.log("Complete");
            resData(xmlhttp.responseText);
        }
        else if(xmlhttp.readyState == 4){
            console.log(xmlhttp.status);
        }
        else{
            console.log("Loading..." + xmlhttp.readyState);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader('Accept', 'application/json');
    xmlhttp.setRequestHeader('user-key', '71130621a2d03f706af0805161610104');
    xmlhttp.send();
}

//Set Center
function setCenter(places, map){
    var lat = places[0].geometry.location.lat();
    var lng = places[0].geometry.location.lng();
    var loc = {lat: lat, lng: lng};
    console.log(loc);
    map.setCenter(loc);
    deleteAllMark();
    addMarker(map,loc);
    zomCall(loc);
    listViewModel.current(places[0].name);
}

//Load data
function resData(data){
    var info = JSON.parse(data);
    var list = info.restaurants;
    console.log("Data to List");
    parseData(list);
};

function parseData(data){
    var restaurants = [];
    var res;
    for(i=0;i<data.length;i++){
        res = data[i].restaurant;
        resObj = {
            name: res.name,
            loc: {
                lat: parseFloat(res.location.latitude),
                lng: parseFloat(res.location.longitude)
            },
            currency: res.currency,
            rating: res.user_rating.aggregate_rating,
            cuisines: res.cuisines
        };
        restaurants.push(resObj);
    }
    console.log(restaurants);
    listViewModel.populateList(restaurants);
    console.log("Data Parsed");
    markRestaurants(restaurants);
}
//Render the restaurants
function markRestaurants(restaurants){
    for(i=0; i<restaurants.length;i++){
        var loc = restaurants[i].loc
        addMarker(map,loc,restaurants[i]);
    };
};



//Function to add markers
function addMarker(map, position, content) {
    var marker = new google.maps.Marker({
        position: position,
        map: map
    });
    var content = content;
    var domText = '';
    if(content == null){
        content = "No Content Available";
    }
    else{
        domText = "<h1>" + content.name + "</h1> \n <h2> Rating: " + content.rating + "  Type: "+ content.cuisines + "</h2>";
    }
    marker.addListener('click',function(){
        info.setContent(domText);
        info.open(map,marker);
    })

    gmarkers.push(marker);
};

//Function to delete markers
function deleteMarker(marker) {
    marker.setMap(null);
};


function deleteAllMark(){
    for(i=0; i < gmarkers.length; i++){
        deleteMarker(gmarkers[i]);
    }
    gmarkers = [];
}


ko.applyBindings(listViewModel);