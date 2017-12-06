let notWorkingCards = null;
const serverData = {};

$(document).ready(() => {
  useEnterToSearch();
  $.get('/invalidCards', (result) => {
    notWorkingCards = result.data;
  });

  $.get('/credentials', (result) => {
    serverData.credentials = result.data;
  });

  $.get('/cityCameras', (result) => {
    serverData.cityCameras = result;
    $('.loader').remove();
    $('.container-fluid').append(getMap());

    let locations = [];

    for (let i in result) {
      let dataAtIndexIsValid = true;
      const infoWindow = displayInfoWindow(result[i]);
      const geolocation = [
        result[i].latitude,
        result[i].longitude
      ];
      const location = [
        infoWindow, geolocation[0], geolocation[1]
      ];
      for (let j in notWorkingCards) {
        if (result[i].description === notWorkingCards[j]) {
          dataAtIndexIsValid = false;
        }
      }
      if (dataAtIndexIsValid) {
        locations.push(location);
      }
    }

    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: new google.maps.LatLng(45.4111700, -75.6981200),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    const infowindow = new google.maps.InfoWindow();

    let marker,
      i;

    for (i = 0; i < locations.length; i++) {
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        map: map
      });

      google.maps.event.addListener(marker, 'click', ((marker, i) => {
        return function() {
          infowindow.setContent(locations[i][0]);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
  });

})

const useEnterToSearch = () => {
  $('#searchBar').focus(function() {
    $(document).keypress(function(e) {
      if (e.which == 13) {
        $('#searchButton').click();
      }
    });
  });
}

const getMap = () => {
  return '<div id="map" class="city-map shadow"></div>';
};

const displayInfoWindow = (location) => {
  const cred = serverData.credentials;
  const url = 'http://traffic.ottawa.ca/opendata/camera';
  const path = `&certificate=${cred.certificate}&id=${cred.id}`;
  const imgSrc = `${url}?c=${location.id}${path}`;
  return (`<br/><h4><b>${location.description}</b></h4><br/>
    <div class="text-center">
      <img class="rounded" style="width: 400px; height: 300px;" src=${imgSrc} alt="Camera Image"/>
    </div><br/>`);
}

const search = () => {
  const searchBar = $('#searchBar').val();
  const dataToFilter = serverData.cityCameras;
  const searchResult = searchAlgorithm(dataToFilter, searchBar);
  $('#displayCards').empty();
  for (let i in searchResult) {
    $('#displayCards').append(card(searchResult[i], i));
  }
  filterCardWithoutImage(searchResult.length)
  if (searchResult.length > 0) {
    $(window).scrollTop($('#displayCards').offset().top);
    let timeDuration = 60;
    $('.form-inline').empty();
    $('.form-inline').append(getTimer(timeDuration));

    const timerId = setInterval(() => {
      timeDuration--;
      $('.form-inline').empty();
      $('.form-inline').append(getTimer(timeDuration));
      if (timeDuration <= 0) {
        $('.form-inline').empty();
        $('.form-inline').append(getSearch());
        clearInterval(timerId);
      }
    }, 1000);

    setInterval(() => {
      $('#displayCards').empty();
      for (let i in searchResult) {
        $('#displayCards').append(card(searchResult[i], i));
        //$('#searchButton').show();
      }
      filterCardWithoutImage(searchResult.length)
    }, 60 * 1000);
  }

}

const searchAlgorithm = (data, searchTerm) => {
  let result = [];
  if (data.length > 0 && searchTerm !== '') {
    for (let i in data) {
      const secondCheck = (data[i].id.toString().includes(searchTerm) || data[i].number.toString().includes(searchTerm));
      if (data[i].description.toLowerCase().includes(searchTerm.toLowerCase()) || data[i].descriptionFr.toLowerCase().includes(searchTerm.toLowerCase()) || secondCheck) {
        result.push(data[i])
      }
    }
  }
  return result;
}

const card = (data, index) => {
  for (let i in notWorkingCards) {
    if (notWorkingCards[i] === data.description) {
      return;
    }
  }
  const cred = serverData.credentials;
  const url = 'http://traffic.ottawa.ca/opendata/camera';
  const path = `&certificate=${cred.certificate}&id=${cred.id}`;
  const imgSrc = `${url}?c=${data.id}${path}`;
  return (`<div class="col-sm-8 col-md-6 col-lg-4 ">
      <div id=${ "card" + index} class="card shadow">
        <img  class="card-img-top img-fluid" src=${imgSrc} alt="Card image cap">
        <div class="card-block">
          <br />
          <div class="contain-card">
            <h4 class="card-title">${data.description}</h4>
          </div>
       </div>
       <br />
       <div class="card-footer text-center">
        <small class="text-muted">
          <b> ${getCurrentDate()} </b>
        </small>
      </div>
    </div>
  </div>`);
}

const getCurrentDate = () => {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  return `${date} ${time}`;
}

const filterCardWithoutImage = (length) => {
  for (let i = 0; i < length; i++) {
    const card = document.getElementById(`card${i}`)
    console.log(card);
  }
}

const getTimer = (currentTime) => {
  return `<a class="badge badge-pill badge-warning shadow">
            <b>
              ${currentTime}
            </b>
          </a>`;
}

const getSearch = () => {
  return `<input onchange="search" id="searchBar" class="form-control mr-sm-2" type="text" placeholder="Search">
  <button id="searchButton" onclick="search()" class="btn btn-outline-dark my-2 my-sm-0" type="submit">Search</button>`
}
