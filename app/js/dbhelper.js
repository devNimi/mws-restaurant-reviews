/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  static validateJSON(response) {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      // read response as JSON
      return response.json();
  }

  static logError(error) {
        console.error(error);
    }

  /**
   * Make an IndexedDB Database
   */
   // OPTIMIZE: using createDatabase everytime is not good, store idbPromise to
   // a variable and use that variable
  static createDatabase() {
      const idbPromise = idb.open('restaurants-review', 2, (upgradeDb) => {
          switch (upgradeDb.oldVersion) {
              case 0:
                  // a placeholder case so that the switch block will
                  // execute when the database is first created
                  // (oldVersion is 0)
              case 1:
                  console.log('Creating the restaurants object store');
                  const restaurantStore = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
              case 2:
                  console.log('Creating the reviews object store');
                  const reviewsStore = upgradeDb.createObjectStore('reviews', {keyPath: 'id', autoIncrement: true});
                  reviewsStore.createIndex('restaurant_id', 'restaurant_id');
          }
      });
      return idbPromise;
  }

  /**
   * Add restaurants to the database
   */
  static addRestaurantsToDB(restaurants) {
      return DBHelper.createDatabase()
          .then((db) => {
              if (!db) {
                  return;
              }
              const tx = db.transaction('restaurants', 'readwrite');
              const store = tx.objectStore('restaurants');

              return Promise.all(restaurants.map((restaurant) => {
                  console.log('adding restaurants to database');
                  return store.put(restaurant);
              }));
          })
          .catch((error) => {
              tx.abort();
              console.error(error);
          });
  }

  /**
   * Get all restaurants from the database
   */
  static fetchRestaurantsFromDB() {
      return DBHelper.createDatabase()
          .then((db) => {
              const tx = db.transaction('restaurants', 'readonly');
              const store = tx.objectStore('restaurants');
              return store.getAll();
          });
  }

  static fetchRestaurantsFromNetwork() {
    return fetch(DBHelper.DATABASE_URL + '/restaurants')
    .then(DBHelper.validateJSON)
    .catch(function(error) {
      console.log('Looks like there was a problem: \n', error);
      return errror;
    });
  }

  /**
   * Fetch all restaurants.
   */
   static fetchRestaurants() {
       // First try to get results from Database
       return DBHelper.fetchRestaurantsFromDB()
           .then(function(response) {
               // If the database is empty
               // Go to the network
               // Add network response to IndexedDB
               if (response.length === 0) {
                   return DBHelper.fetchRestaurantsFromNetwork()
                       .then((response) => {
                           DBHelper.addRestaurantsToDB(response);
                           return response;
                       })
                       .catch(DBHelper.logError);
               }
               return response;
           });
   }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    // fetch all restaurants with proper error handling.
    return DBHelper.fetchRestaurants()
    .then(function(response) {
      const restaurant = response.find((r) => r.id == id);
      if (restaurant) { // Got the restaurant
        return restaurant;
      } else { // Restaurant does not exist in the database
        return null;
      }
    })
    .catch(function(error) {
      console.log('Looks like there was a problem: \n', error);
      return error;
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants()
    .then((response)=>{
      const restaurants = response;
      // Filter restaurants to have only given cuisine type
      const results = restaurants.filter((r) => r.cuisine_type == cuisine);
      return results;
    })
    .catch((error)=>{
      return error;
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants

    DBHelper.fetchRestaurants()
    .then((response)=>{
      const restaurants = response;
      // Filter restaurants to have only given neighborhood
      const results = restaurants.filter((r) => r.neighborhood == neighborhood);
      return results;
    })
    .catch((error)=>{
      return error;
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then((response)=>{
      const restaurants = response;
      let results = restaurants;
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter((r) => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter((r) => r.neighborhood == neighborhood);
      }
      return results;
    })
    .catch((error)=>{
      console.log('Looks like there was a problem: \n', error);
      return error;
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    return DBHelper.fetchRestaurants()
    .then((response)=>{
      const restaurants = response;
      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
      return uniqueNeighborhoods;
    })
    .catch(function(error) {
      console.log('Looks like there was a problem: \n', error);
      return error;
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then((response)=>{
      const restaurants = response;
      // Get all cuisines from all restaurants
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
      // Remove duplicates from cuisines
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
      return uniqueCuisines;
    })
    .catch(function(error) {
      console.log('Looks like there was a problem: \n', error);
      return error;
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Add All reviews to the Index DB from network
   */
  static addReviewsToIndexDB(reviews) {
      return DBHelper.createDatabase()
          .then((db) => {
              if (!db) {
                  return;
              }
              const tx = db.transaction('reviews', 'readwrite');
              const store = tx.objectStore('reviews');

              return Promise.all(reviews.map((review) => {
                  console.log('adding reviews to database');
                  return store.put(review);
              }));
          })
          .catch((error) => {
              tx.abort();
              console.error(error);
          });
  }

  /**
  * add review submitted by user to IndexedDB
  **/

  /**
   * Fetch reviews from database
   */
   static addUserReviewToIndexDB(review) {
     console.log(review);
     return DBHelper.createDatabase()
            .then((db) => {
                const tx = db.transaction('reviews', 'readwrite');
                const store = tx.objectStore('reviews');
                return store.put(review);
            })
            .catch(DBHelper.logError);
   };

   /**
    * Add review submitted by user to remote database
    */
   static postReview(review) {
     DBHelper.postReviewtoServer(review)
     .then((review)=>{
       console.log('user review submitted to server successfully');
     })
     .catch(()=>{
       // here we'll handle backgraound sync
     });
   }

   /**
    * Submit review to server
    */
   static postReviewtoServer(review) {
       const url = 'http://localhost:1337/reviews/';
       const options = {
           method: 'POST',
           body: JSON.stringify(review),
       };
       return fetch(url, options);
   }

  static fetchReviewsByIdFromDB(id) {
      console.log('fetchReviewsfromDB');
      return DBHelper.createDatabase()
          .then((db) => {
              const tx = db.transaction('reviews', 'readonly');
              const store = tx.objectStore('reviews');
              const index = store.index('restaurant_id');
              return index.getAll(id);
          });
  }

  /**
   * Go to network to get reviews by restaurant id
   */
  static fetchReviewsByIdFromNetwork(id) {
      console.log('fetch reviews from network');
      return fetch(DBHelper.DATABASE_URL + `/reviews/?restaurant_id=${id}`)
          .then(DBHelper.validateJSON)
          // TODO:  might not need it
          .then((response) => {
              return response;
          })
          // TODO: this error handling
          .catch(DBHelper.logError);
  }

/**
 * Fetch reviews from DB
 * If no reviews, fetch from network
 * add to database
 */
static fetchReviewsById(id) {
    return DBHelper.fetchReviewsByIdFromDB(id)
        .then(function(response) {
            if (response.length === 0) {
                return DBHelper.fetchReviewsByIdFromNetwork(id)
                    .then((response) => {
                        DBHelper.addReviewsToIndexDB(response);
                        return response;
                    })
                    .catch(DBHelper.logError);
            }
            return response;
        });
}







}
