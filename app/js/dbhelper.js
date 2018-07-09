/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Make an IndexedDB Database
   */
  static createDatabase() {
      const idbPromise = idb.open('restaurants-review', 1, (upgradeDb) => {
          switch (upgradeDb.oldVersion) {
              case 0:
                  // a placeholder case so that the switch block will
                  // execute when the database is first created
                  // (oldVersion is 0)
              case 1:
                  console.log('Creating the restaurants object store');
                  let restaurantStore = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
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
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static fetchRestaurantsFromNetwork() {
    return fetch(DBHelper.DATABASE_URL)
    .then(function(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      // Read the response as json.
      return response.json();
    })
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

}
