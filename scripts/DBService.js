const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';


const DBService = class {

  constructor() {
    this.API_KEY = 'e419df525311c126b7200bab6192985c';
    this.SERVER = 'https://api.themoviedb.org/3';
  }
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Failed to get data at ${url}`);
    }
  }

  getTestData = () => {
    return this.getData('test.json');
  }
  getTestCard = () => {
    return this.getData('card.json');
  }

  // запрос на сервер,  получаю поиск через API, первая страница, запрос был через поисковую строку
  getSearchResult = query => {
    this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&language=en-US&query=${query}&include_adult=false`;
    // ( строку получила тут https://developers.themoviedb.org/3/search/search-tv-shows )
    return this.getData(this.temp);
  }
  // пагинация, следующая страница
  getNextPage = page => {
    return this.getData(this.temp + '&page=' + page);
  }

  // запрашиваю данные у сервера для модального окна через ID  фильма
  getTvShow = id => {
    return this.getData(this.SERVER + '/tv/' + id + '?api_key=' + this.API_KEY + '&language=en-US');
  }

  getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=en-US`);
  getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=en-US`);
  getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=en-US`);
  getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=en-US`);
}

const dbService = new DBService();
// пример запроса на сервер - поиск
console.log(dbService.getSearchResult('папа'));



//создаю карточки с фильмами из json
const renderCard = (response, target) => {
  console.log(response);
  //очищаю список с фильмами
  tvShowsList.textContent = '';
  // если пользователь ввел дурацкий запрос
  const col = response.results.length;
  if (col === 0) {
    loading.remove();
    tvShowsHead.textContent = 'Unfortunately, no results...';
    tvShowsHead.style.cssText = 'color: red; font-size: 40px;';//style.cssText - используется когда больше 1 стиля
    // return;
  } else {
    // после дурацкого запроса возвращаем надпись search results, если кликнули на дропменю, его заголовок пишется на странице   
    tvShowsHead.textContent = target ? target.textContent : 'Search results';
    tvShowsHead.style.cssText = 'color: green; font-size: 20px;';
  }



  response.results.forEach(item => {
    //деструктурирую обьект и меняю название переменных
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote,
      id

    } = item;

    //**** проверки на наличие картинки, bg, и красного флажка с рейтингом
    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster-available.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : '';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

    const card = document.createElement('li');

    card.classList.add('tv-shows__item');// ИЛИ card.className = 'tv-shows__item'; className = затирает все предыдущие классы, подходит для вновь созданных

    card.innerHTML = `
    <a href="#" id="${id}" class="tv-card">
    ${voteElem}
    <img class="tv-card__img"
         src="${posterIMG}" 
         data-backdrop="${backdropIMG}"
         alt="${title}">
    <h4 class="tv-card__head">${title}</h4>
</a>
        `;

    // tvShowsList.insertAdjacentElement('afterbegin', card); альтернатива!!!!
    loading.remove();
    tvShowsList.append(card);
  });
  // пагинация
  pagination.textContent = '';//очищать после предыдущего запроса
  if (!target && response.total_pages > 1) {
    for (let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li><a href="#" class = "pages">${i}</a></li>`;
    }
  }

};

// ******связываю форму поиска с возмоностью отправить запрос на сервер

// submit - событие при отправки формы или нажатия enter
searchForm.addEventListener('submit', event => {
  event.preventDefault();//при нажатии enter,отменяет стандартное браузерное поведение, в этом случае - страница не перегружается
  const value = searchFormInput.value.trim();//trim() = убирает пробелы в строке
  searchFormInput.value = '';
  // если пользователь ввел назвние фильма в форму поиска
  if (value) {
    tvShows.append(loading);//прелоудер, если низкий интернет

    // делаю запрос на сервер и выполняю рендер
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});


