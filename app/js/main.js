let restaurants;
let neighborhoods;
let cuisines;
var map;
var markers = [];

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(function(registration) {
      console.log(
        'Service Worker registration successful with scope: ',
        registration.scope
      );
    })
    .catch(function(err) {
      console.log('Service Worker registration failed: ', err);
    });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
});

toggleFavourite = (checkboxId, restaurantId) => {
  if (document.getElementById(checkboxId).checked) {
    console.log('checked');
    DBHelper.toggleFavouriteToIndexDB(restaurantId, true);
    DBHelper.postToggleFavourite(restaurantId, true);
  } else {
    console.log('un-checked');
    DBHelper.toggleFavouriteToIndexDB(restaurantId, false);
    DBHelper.postToggleFavourite(restaurantId, false);
  }
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
    .then(neighborhoods => {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    })
    .catch(error => {
      // Got an error!
      console.log(error);
    });
};

/*
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines()
    .then(cuisines => {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    })
    .catch(error => {
      // Got an error!
      console.log(error);
    });
};

/*
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();

  // Screen reader users rely on frame titles to describe the contents of frames
  // Adds title to iframe element created by Google Maps
  // https://stackoverflow.com/questions/49012240/google-maps-js-iframe-title
  google.maps.event.addListenerOnce(map, 'idle', () => {
    document.getElementsByTagName('iframe')[0].title = 'Google Maps';
  });
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  console.log(cuisine, neighborhood);
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(restaurants => {
      removeLoader();
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    })
    .catch(error => {
      // Got an error!
      console.log(error);
    });
};

// remove the loader once, restaurants are fetched
removeLoader = () => {
  const Loader = document.getElementById('loader-container');

  Loader.remove();
};
/*
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/*
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/*
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement('li');
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `${restaurant.name}`;
  li.append(image);

  const restaurantDetailsContainer = document.createElement('div');
  restaurantDetailsContainer.className = 'restaurant-details-container';
  li.append(restaurantDetailsContainer);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  restaurantDetailsContainer.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  restaurantDetailsContainer.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  restaurantDetailsContainer.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('role', 'button');
  more.setAttribute('aria-label', `view more details for ${restaurant.name}`);
  restaurantDetailsContainer.append(more);
  return li;
};

/*
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

// listen for messages from service serviceWorker
// https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
if (navigator.serviceWorker) {
  console.log('listener added for pending favourites');
  navigator.serviceWorker.addEventListener('message', message => {
    if (message.data.message === 'post-offline-favourites-to-server') {
      DBHelper.fetchPendingFavouritesFromIndexDB();
    }
  });
}
