let films = [];
let currentFilm = null;

const filmsList = document.getElementById("films");
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const runtime = document.getElementById("runtime");
const filmInfo = document.getElementById("film-info");
const showtime = document.getElementById("showtime");
const ticketNum = document.getElementById("ticket-num");
const buyTicketBtn = document.getElementById("buy-ticket");

const url = "https://my-json-server.typicode.com/Tan-dev202/phase-1-week-3-code-challenge/films";

document.addEventListener("DOMContentLoaded", () => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      films = data;
      renderFilmsList(films);

      if (films.length > 0) {
        displayFilmDetails(films[0].id);
      }
    });

  function fetchFilmById(id) {
    return fetch(`${url}${id}`)
      .then((response) => response.json());
  }

  function displayFilmDetails(id) {
    fetchFilmById(id).then((film) => {
      currentFilm = film;
      const availableTickets = film.capacity - film.ticketsSold;

      poster.src = film.poster;
      poster.alt = film.title;
      title.textContent = film.title;
      runtime.textContent = `${film.runtime} minutes`;
      filmInfo.textContent = film.description;
      showtime.textContent = film.showtime;
      ticketNum.textContent = availableTickets;

      if (availableTickets <= 0) {
        buyTicketBtn.textContent = "Sold Out";
        buyTicketBtn.disabled = true;
        buyTicketBtn.classList.replace("orange", "grey");
      } else {
        buyTicketBtn.textContent = "Buy Ticket";
        buyTicketBtn.disabled = false;
        buyTicketBtn.classList.replace("grey", "orange");
      }
    });
  }

  function renderFilmsList(films) {
    filmsList.innerHTML = "";
    
    films.forEach((film) => {
      const li = document.createElement("li");
      li.classList.add("film", "item");
      if (film.capacity <= film.ticketsSold) {
        li.classList.add("sold-out");
      }

      const titleSpan = document.createElement("span");
      titleSpan.textContent = film.title;
      titleSpan.style.cursor = "pointer";
      titleSpan.addEventListener("click", () => displayFilmDetails(film.id));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("ui", "mini", "red", "button");
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteFilm(film.id);
      });

      li.appendChild(titleSpan);
      li.appendChild(deleteButton);
      filmsList.appendChild(li);
    });
  }

  function buyTicket() {
    if (!currentFilm) return;
    const availableTickets = currentFilm.capacity - currentFilm.ticketsSold;
    if (availableTickets <= 0) {
      alert("Sorry, this showing is sold out!");
      return;
    }

    const updatedTicketsSold = currentFilm.ticketsSold + 1;
    
    fetch(`${url}${currentFilm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketsSold: updatedTicketsSold })
    })
    .then(() => {
      currentFilm.ticketsSold = updatedTicketsSold;
      const filmIndex = films.findIndex((film) => film.id === currentFilm.id);
      if (filmIndex !== -1) {
        films[filmIndex].ticketsSold = updatedTicketsSold;
      }
      renderFilmsList(films);
      ticketNum.textContent = currentFilm.capacity - currentFilm.ticketsSold;
      
      if (currentFilm.capacity - currentFilm.ticketsSold <= 0) {
        buyTicketBtn.textContent = "Sold Out";
        buyTicketBtn.disabled = true;
        buyTicketBtn.classList.replace("orange", "grey");
      }
    });
  }

  function deleteFilm(id) {
    fetch(`${url}${id}`, { method: "DELETE" })
    .then(() => {
      films = films.filter((film) => film.id !== id);
      renderFilmsList(films);
      if (currentFilm && currentFilm.id === id) {
        if (films.length > 0) {
          displayFilmDetails(films[0].id);
        } else {
          currentFilm = null;
          poster.src = "assets/poster-placeholder.webp";
          poster.alt = "[MOVIE TITLE]";
          title.textContent = "[MOVIE TITLE]";
          runtime.textContent = "[RUNTIME] minutes";
          filmInfo.textContent = "[INSERT MOVIE DESCRIPTION HERE]";
          showtime.textContent = "[SHOWTIME]";
          ticketNum.textContent = "[X]";
          buyTicketBtn.textContent = "Buy Ticket";
          buyTicketBtn.disabled = true;
        }
      }
      alert(`Film "${id}" has been deleted successfully!`);
    });
  }

  buyTicketBtn.addEventListener("click", buyTicket);
});
