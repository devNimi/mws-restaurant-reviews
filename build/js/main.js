let restaurants,neighborhoods,cuisines;var map,markers=[];"serviceWorker"in navigator&&navigator.serviceWorker.register("sw.js").then(function(e){console.log("Service Worker registration successful with scope: ",e.scope)}).catch(function(e){console.log("Service Worker registration failed: ",e)}),document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");console.log(t),e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants(),google.maps.event.addListenerOnce(map,"idle",()=>{console.log("addition succss"),document.getElementsByTagName("iframe")[0].title="Google Maps"})}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,s=t.selectedIndex,r=e[n].value,o=t[s].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(r,o,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li"),n=document.createElement("img");n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e),n.alt=`${e.name}`,t.append(n);const s=document.createElement("div");s.className="restaurant-details-container",t.append(s);const r=document.createElement("h2");r.innerHTML=e.name,s.append(r);const o=document.createElement("p");o.innerHTML=e.neighborhood,s.append(o);const a=document.createElement("p");a.innerHTML=e.address,s.append(a);const l=document.createElement("a");return l.innerHTML="View Details",l.href=DBHelper.urlForRestaurant(e),l.setAttribute("role","button"),l.setAttribute("aria-label",`view more details for ${e.name}`),s.append(l),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})});