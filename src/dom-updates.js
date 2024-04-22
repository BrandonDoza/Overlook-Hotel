import {
  getAllCustomerRoomBookings,
  getTotalCostForAllBookings,
} from "./user.js";
import { getAvailableRooms, filterAvailableRoomsByType } from "./booking.js";
import { getAllData, addBooking, cancelBooking, getUser } from "./api-calls.js";

//<><>query selectors<><>
const myBookingsButton = document.getElementById("my-bookings-button");
const bookARoomButton = document.getElementById("book-a-room-button");
const bookThisRoomButton = document.getElementById("book-room-button");
const cancelBookingButton = document.getElementById("cancel-room-button");
const userLoginButton = document.getElementById("user-login-button");
const userBookingsBackButton = document.getElementById(
  "back-from-bookings-button"
);
const searchBookingsBackButton = document.getElementById(
  "back-from-search-button"
);
const dateInput = document.getElementById("date");
const roomTypeInput = document.getElementById("room-type");
const userNameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const bookedText = document.getElementById("booked-text");
const canceledText = document.getElementById("canceled-text");
const loginHeading = document.getElementById("login-heading");
const bookingDisplay = document.querySelector(".content-display");
const totalSpentDisplay = document.querySelector(".total-spent");
const submitButton = document.querySelector(".submit-button");
const filterSearchButton = document.querySelector(".filter-submit-button");
const dateForm = document.querySelector(".date-form");
const filterByRoomTypeDisplay = document.querySelector(".type-search-form");
const loginForm = document.querySelector(".login-form");
const welcomeHeader = document.querySelector(".welcome-header");

//<><>data model<><>
let allData;
let customer;
let bookingsByDate;
let filteredBookings;
let currentBooking;
let date;
const images = [
  "https://www.cvent.com/sites/default/files/image/2021-10/hotel%20room%20with%20beachfront%20view.jpg",
  "https://www.rd.com/wp-content/uploads/2023/05/GettyImages-1445292736.jpg",
  "https://www.travelandleisure.com/thmb/OiDnPGo3k9QLRT9__TPhFZcr7PU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/rosewood-carlyle-presidential-suite-LUXESUITE0122-0046808a88924e57922d78c7f1d9ca60.jpg",
  "https://hoteldel.com/wp-content/uploads/2021/03/hotel-del-coronado-views-suite-K1TOS1-K1TOJ1-1600x1000-1.jpg",
];

//<><>event listeners<><>
myBookingsButton.addEventListener("click", () => {
  bookingDisplay.innerHTML = "";
  let bookings = allData[2].bookings;
  let rooms = allData[1].rooms;
  customer.bookings = getAllCustomerRoomBookings(customer, bookings, rooms);
  let bookingCards = createUserBookedRoomsCard(customer.bookings);
  populateContentDisplay(bookingCards);
  showElements([totalSpentDisplay]);
  hideElements([
    dateForm,
    filterByRoomTypeDisplay,
    bookThisRoomButton,
    cancelBookingButton,
    bookedText,
    canceledText,
    searchBookingsBackButton
  ]);
  let totalSpentByCustomer = getTotalCostForAllBookings(customer.bookings);
  totalSpentDisplay.innerText = `You have spent a total of $${totalSpentByCustomer} on ${customer.bookings.length} rooms`;
  totalSpentDisplay.ariaLabel = `You have spent a total of $${totalSpentByCustomer} on ${customer.bookings.length} rooms`
});

bookARoomButton.addEventListener("click", () => {
  showElements([dateForm]);
  hideElements([totalSpentDisplay, bookedText, userBookingsBackButton]);
});

submitButton.addEventListener("click", function (event) {
  event.preventDefault();
  bookingDisplay.innerHTML = "";
  welcomeHeader.innerText = "One Moment While We Retrieve Bookings";
  showElements([filterByRoomTypeDisplay]);
  hideElements([bookThisRoomButton, cancelBookingButton]);
  const dateInput = document.getElementById("date");
  date = dateInput.value.toString();
  let bookings = allData[2].bookings;
  let rooms = allData[1].rooms;
  bookingsByDate = getAvailableRooms(bookings, rooms, date);
  let bookingCards = createAvailableBookingsCard(bookingsByDate);
  setTimeout(() => {
    populateContentDisplay(bookingCards);
    dateForm.reset();
    welcomeHeader.innerText = "";
  }, 100);
});

filterSearchButton.addEventListener("click", (event) => {
  event.preventDefault();
  bookingDisplay.innerHTML = "";
  welcomeHeader.innerText = "One Moment While We Retrieve Bookings";
  hideElements([bookThisRoomButton, cancelBookingButton]);
  const filteredType = document.getElementById("room-type");
  const roomType = filteredType.value;
  filteredBookings = filterAvailableRoomsByType(bookingsByDate, roomType);
  let bookingCards = createAvailableBookingsCard(filteredBookings);
  setTimeout(() => {
    populateContentDisplay(bookingCards);
    welcomeHeader.innerText = "";
  }, 100);
  filterByRoomTypeDisplay.reset();
});

userBookingsBackButton.addEventListener("click", () => {
  bookingDisplay.innerHTML = "";
  let bookings = allData[2].bookings;
  let rooms = allData[1].rooms;
  customer.bookings = getAllCustomerRoomBookings(customer, bookings, rooms);
  let bookingCards = createUserBookedRoomsCard(customer.bookings);
  populateContentDisplay(bookingCards);
  hideElements([
    userBookingsBackButton,
    cancelBookingButton,
    bookThisRoomButton,
  ]);
});

searchBookingsBackButton.addEventListener("click", () => {
  bookingDisplay.innerHTML = "";
  welcomeHeader.innerText = "One Moment While We Retrieve Bookings";
  let bookings = allData[2].bookings;
  let rooms = allData[1].rooms;
  bookingsByDate = getAvailableRooms(bookings, rooms, date);
  let bookingCards = createAvailableBookingsCard(bookingsByDate);
  setTimeout(() => {
    populateContentDisplay(bookingCards);
    welcomeHeader.innerText = "";
  }, 100);
  hideElements([
    searchBookingsBackButton,
    cancelBookingButton,
    bookThisRoomButton,
  ]);
});

dateInput.addEventListener("input", () => {
  disableButton(dateInput, submitButton);
});

roomTypeInput.addEventListener("input", () => {
  disableButton(roomTypeInput, filterSearchButton);
});

bookingDisplay.addEventListener("click", (event) => {
  if (event.target.classList.contains("user-booked-card")) {
    currentBooking = findBooking(event.target.id, customer.bookings);
    const bookingToDisplay = renderSingleBooking(currentBooking);
    bookingDisplay.innerHTML = bookingToDisplay;
    bookThisRoomButton.innerText = "Book Room";
    showElements([cancelBookingButton, userBookingsBackButton]);
    hideElements([bookThisRoomButton]);
  } else if (event.target.classList.contains("available-booking-card")) {
    currentBooking = findBooking(event.target.id, bookingsByDate);
    const bookingToDisplay = renderSingleBooking(currentBooking);
    bookingDisplay.innerHTML = bookingToDisplay;
    bookThisRoomButton.innerText = "Book Room";
    showElements([bookThisRoomButton, searchBookingsBackButton]);
    hideElements([cancelBookingButton]);
  }
});

bookingDisplay.addEventListener("keydown", (event) => {
  if (
    event.target.classList.contains("user-booked-card") &&
    event.key === "Enter"
  ) {
    currentBooking = findBooking(event.target.id, customer.bookings);
    const bookingToDisplay = renderSingleBooking(currentBooking);
    bookingDisplay.innerHTML = bookingToDisplay;
    bookThisRoomButton.innerText = "Book Room";
    showElements([cancelBookingButton]);
    hideElements([bookThisRoomButton]);
  } else if (
    event.target.classList.contains("available-booking-card") &&
    event.key === "Enter"
  ) {
    currentBooking = findBooking(event.target.id, bookingsByDate);
    const bookingToDisplay = renderSingleBooking(currentBooking);
    bookingDisplay.innerHTML = bookingToDisplay;
    bookThisRoomButton.innerText = "Book Room";
    showElements([bookThisRoomButton]);
    hideElements([cancelBookingButton]);
  }
});

bookThisRoomButton.addEventListener("click", () => {
  date = date.split("-").join("/");
  let bookingToAdd = {
    userID: customer.id,
    date: date,
    roomNumber: currentBooking.number,
  };
  addBooking(bookingToAdd)
    .then((response) => {
      console.log(response);
      const newBooking = response.newBooking;
      allData[2].bookings.push(newBooking);
      showElements([bookedText]);
      hideElements([bookThisRoomButton, canceledText]);
      return getAllData();
    })
    .then((apiData) => {
      allData = apiData;
    });
});

cancelBookingButton.addEventListener("click", () => {
  cancelBooking(currentBooking.id)
    .then((response) => {
      let bookings = allData[2].bookings;
      let bookingToRemove = removeBooking(bookings, currentBooking);
      bookings.splice(bookingToRemove, 1);
      showElements([canceledText]);
      hideElements([cancelBookingButton, bookedText]);
      return getAllData();
    })
    .then((apiData) => {
      allData = apiData;
    });
});

userLoginButton.addEventListener("click", (event) => {
  event.preventDefault();
  const username = userNameInput.value;
  const id = getUserIdForLogin(username);
  console.log(userNameInput.value, passwordInput.value);
  if (
    userNameInput.value === `customer${id}` &&
    passwordInput.value === "overlook2021"
  ) {
    getUser(id).then((user) => {
      console.log("user", user);
      customer = user;
      let bookings = allData[2].bookings;
      let rooms = allData[1].rooms;
      customer.bookings = getAllCustomerRoomBookings(customer, bookings, rooms);
      welcomeHeader.innerText = `Welcome Back ${customer.name}`;
      showElements([myBookingsButton, bookARoomButton]);
      loginForm.reset();
      myBookingsButton.focus();
      setTimeout(() => {
        hideElements([loginForm]);
      }, 1000);
    });
  } else {
    loginHeading.innerText =
      "username or password is incorrect, please try again";
    setTimeout(() => {
      loginHeading.innerText = "Login";
    }, 2500);
    loginForm.reset();
  }
});

//<><>event handlers<><>
export const load = () => {
  document.addEventListener("DOMContentLoaded", function () {
    getAllData().then((apiData) => {
      allData = apiData;
    });
  });
};

function populateContentDisplay(bookings) {
  if (
    bookings ===
      "We apologize, but unfortunately there are no rooms by that type available" ||
    bookings ===
      "We apologize, but unfortunately there are no rooms for your selected date"
  ) {
    bookingDisplay.innerHTML = `<h2>${bookings}</h2>`;
  } else {
    bookings.forEach((booking) => {
      bookingDisplay.innerHTML += booking;
    });
  }
}

function showElements(elements) {
  const shownElement = elements.forEach((element) => {
    element.classList.remove("hidden");
  });
  return shownElement;
}

function hideElements(elements) {
  const hiddenElement = elements.forEach((element) => {
    element.classList.add("hidden");
  });
  return hiddenElement;
}

function renderSingleBooking(booking) {
  console.log("thisbooking", booking);
  const singleBooking = `<div class="single-booking-display" tabindex='0' role="region">
      <h1>${booking.roomType.toUpperCase()}</h1>
      <article aria-label="Number of Beds: ${booking.numBeds}">Number of Beds: ${booking.numBeds}</article>
              <article aria-label="Bed Size: ${booking.bedSize}">Bed Size: ${booking.bedSize}</article>
              <article aria-label="Cost Per Night: ${booking.costPerNight}">Cost Per Night: ${booking.costPerNight}</article>
              <img src="${generateRandomImage(
                images
              )}" alt="hotel room with bed">
      </div>`;
  return singleBooking;
}

function disableButton(field, button) {
  if (field.value !== "") {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

//<><>functions<><>
function createUserBookedRoomsCard(bookings) {
  const userBookingsCards = bookings.map((booking, i) => {
    let card = `<div class="user-booked-card" id=${i} tabindex='0' role="region">
        <h2>${booking.roomType.toUpperCase()} - ${booking.bedSize.toUpperCase()} BED</h2>
        <article aria-label="Number of Beds: ${booking.numBeds}">Number of Beds: ${booking.numBeds}</article>
        <article aria-label="You have booked this on ${booking.dateBooked} at a cost of $${
            booking.costPerNight
          } per night">You have booked this on ${booking.dateBooked} at a cost of $${
      booking.costPerNight
    } per night</article>
</div>`;
    return card;
  });
  return userBookingsCards;
}

function createAvailableBookingsCard(bookings) {
  const availableBookingCards = bookings.map((booking, i) => {
    let card = `<div class="available-booking-card" id=${i} tabindex='0' role="region">
            <h2>${booking.roomType.toUpperCase()}</h2>
            <article aria-label="Number of Beds: ${booking.numBeds}">Number of Beds: ${booking.numBeds}</article>
            <article aria-label="Bed Size: ${booking.bedSize}">Bed Size: ${booking.bedSize}</article>
            <article aria-label="Cost Per Night: ${booking.costPerNight}">Cost Per Night: ${booking.costPerNight}</article>
    </div>`;
    return card;
  });
  return availableBookingCards;
}

function findBooking(target, bookings) {
  let booking = bookings[target];
  return booking;
}

function generateRandomImage(images) {
  let randomIndex = Math.floor(Math.random() * images.length);
  let randomImage = images[randomIndex];
  return randomImage;
}

function removeBooking(bookings, currentBooking) {
  const bookingToRemove = bookings.findIndex((booking) => {
    return booking.id === currentBooking.id;
  });
  return bookingToRemove;
}

function getUserIdForLogin(username) {
  const prefix = "customer";
  if (username.includes(prefix) && username.length > prefix.length) {
    const idStr = username.slice(prefix.length);
    const id = parseInt(idStr, 10);
    if (id <= allData[0].customers.length) {
      return id;
    }
  }
}
