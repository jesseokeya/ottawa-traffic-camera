let dataToDisplay = [];
const serverData = {};

$(document).ready(() => {
  $.get('/invalidCards', (result) => {
    serverData.invalidCards = result.data;
    $.get('/credentials', (result) => {
      serverData.credentials = result.data;
      $.get('/cityCameras', (result) => {
        serverData.cityCameras = result;
        $('.loader').remove();
        $('#searchBar').val(' ');
        $('#searchButton').click();
      });
    });
  });

});

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
  const invalid = serverData.invalidCards;
  const cameras = serverData.cityCameras;
  const cred = serverData.credentials;
  const dataToFilter = getDataToFilter(invalid, cameras, cred);
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

const getDataToFilter = (invalid, cameras, cred) => {
  const result = [];
  for(let i in invalid){
    for (let j in cameras){
      if(invalid[i] === cameras[j].description){
        result.push(cameras[j]);
      }
    }
  }
  return result;
}
