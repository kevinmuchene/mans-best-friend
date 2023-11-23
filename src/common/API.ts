const apiMainURL = "https://frontend-take-home-service.fetch.com";

const authLogInService = "/auth/login";
const authLogOutService = "/auth/logout";
const fetchBreeds = "/dogs/breeds";
const searchAPI = "/dogs/search";
const fetchDogs = "/dogs";
const matchFavoriteDog = "/dogs/match";

const APIs = {
  getAuthCookie: function () {
    return `${apiMainURL}${authLogInService}`;
  },
  logoutAPI: function () {
    return `${apiMainURL}${authLogOutService}`;
  },
  fetchBreeds: function () {
    return `${apiMainURL}${fetchBreeds}`;
  },
  searchDogs: function (dogBreedsString, minAge, maxAge, zip_code) {
    console.log(
      `${apiMainURL}${searchAPI}?ageMin=${minAge}&ageMax=${maxAge}${
        zip_code ? `&zipCodes=${zip_code}` : ""
      }${dogBreedsString ? `&breeds=${dogBreedsString}` : ""} `
    );

    return `${apiMainURL}${searchAPI}?ageMin=${minAge}&ageMax=${maxAge}${
      zip_code ? `&zipCodes=${zip_code}` : ""
    }${dogBreedsString ? `&breeds=${dogBreedsString}` : ""} `;
  },
  fetchDogs: function () {
    return `${apiMainURL}${fetchDogs}`;
  },
  fetchNextPageData: function (nextAPI) {
    return `${apiMainURL}${nextAPI}`;
  },
  matchFavoriteDog: function () {
    return `${apiMainURL}${matchFavoriteDog}`;
  },
};

export default APIs;
// &minAge=${minAge}&maxAge=${maxAge}&zipcode=${zipcode}`