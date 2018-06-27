let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  // fetchRestaurantFromURL((error, restaurant) => {
    // if (error) { // Got an error!
    //   console.error(error);
    // } else {
    //   console.log('ent else');
    //   self.map = new google.maps.Map(document.getElementById('map'), {
    //     zoom: 16,
    //     center: restaurant.latlng,
    //     scrollwheel: false,
    //   });
    //   fillBreadcrumb();
    //   DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    //   // Screen reader users rely on frame titles to describe the contents of frames
    //   // Adds title to iframe element created by Google Maps
    //   // https://stackoverflow.com/questions/49012240/google-maps-js-iframe-title
    //   google.maps.event.addListenerOnce(self.map, 'idle', () => {
    //     document.getElementsByTagName('iframe')[0].title = 'Google Maps';
    //   });
    // }

    fetchRestaurantFromURL(restaurant)
    .then((restaurant)=>{
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false,
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      // Screen reader users rely on frame titles to describe the contents of frames
      // Adds title to iframe element created by Google Maps
      // https://stackoverflow.com/questions/49012240/google-maps-js-iframe-title
      google.maps.event.addListenerOnce(self.map, 'idle', () => {
        document.getElementsByTagName('iframe')[0].title = 'Google Maps';
      });
    })
    .catch((error)=>{// Got an error
      console.log(error);
    });
  };

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (restaurant) => {
  if (self.restaurant) { // restaurant already fetched!
    // callback(null, self.restaurant);
    Promise.resolve(self.restaurant);
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'.
    // callback(error, null);
    Promise.resolve(self.restaurant);
  } else {
    return DBHelper.fetchRestaurantById(id)
    .then((restaurant)=>{
      self.restaurant = restaurant;
      fillRestaurantHTML();
      // callback(null, restaurant);
      return restaurant;
    })
    .catch((error)=>{
      console.log(error);
      return error;
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `${restaurant.name}`;
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/*
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    if (operatingHours.hasOwnProperty(key)) {
      const row = document.createElement('tr');
      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);
      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);
      hours.appendChild(row);
    }
  }
};

/*
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.className = 'grid-8';
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/*
 * Create review HTML and add it to the webpage.
 */
 createReviewHTML = (review) => {
   const li = document.createElement('li');
   // create div for review heading which include name and date
   const reviewHeadingDiv = document.createElement('div');
   reviewHeadingDiv.className = 'review-heading';
   const name = document.createElement('h3');
   // const name = document.createElement('p');
   name.innerHTML = review.name;
   reviewHeadingDiv.appendChild(name);
   li.appendChild(reviewHeadingDiv);
   // append date to heading
   const date = document.createElement('span');
   date.className = 'float-right';
   date.innerHTML = review.date;
   name.appendChild(date);

   // create div for review content
   const reviewContentDiv = document.createElement('div');
   reviewContentDiv.className = 'review-content';
   const rating = document.createElement('p');
   rating.className = 'rating-btn';
   rating.innerHTML = `Rating: ${review.rating}`;
   reviewContentDiv.appendChild(rating);

   const comments = document.createElement('p');
   comments.innerHTML = review.comments;
   reviewContentDiv.appendChild(comments);
   li.appendChild(reviewContentDiv);
   return li;
 };

/*
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/*
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
