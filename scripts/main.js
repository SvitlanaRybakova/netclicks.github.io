//теню
const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');

// создаю элемент прелоудер
const loading = document.createElement('div');
loading.className = 'loading';
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');
const pagination = document.querySelector('.pagination');


// закрытие выпадающего списка при закрытии меню
const closeDropDown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  })
}
// открытие - закрытие меню по кнопке
hamburger.addEventListener('click', (event) => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropDown();
});

// закрытие меню если клик произошел по body
document.addEventListener('click', (event) => {
  if (!event.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropDown();
  }
});

// дропменю
leftMenu.addEventListener('click', event => {
  event.preventDefault(); // что бы не перепрыгивать на начало страницы когда кликаем на кнопки меню
  const target = event.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    // кликаем на иконки - раскрывается и меню и выпадающий список
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }
  // обработка категорий из выпадающего списка меню(топ-сериалы, популярное...)
  // топ-сериалы
  if (target.closest('#top-rated')) {
    tvShows.append(loading);//прелоудер, если низкий интернет
    dbService.getTopRated().then((response) => renderCard(response, target));
  }
  // популярное
  if (target.closest('#popular')) {
    tvShows.append(loading);//прелоудер, если низкий интернет
    dbService.getPopular().then((response) => renderCard(response, target));
  }
  // новые эпизоды сегодня
  if (target.closest('#today')) {
    tvShows.append(loading);//прелоудер, если низкий интернет
    dbService.getToday().then((response) => renderCard(response, target));
  }
  // новые эпизоды в течении недели
  if (target.closest('#week')) {
    tvShows.append(loading);//прелоудер, если низкий интернет
    dbService.getWeek().then((response) => renderCard(response, target));
  }
  // реализовываю поиск из бокового меню
  if (target.closest('#search')) {
    // если кликнем на поиск, то из страницы пропадает все результаты предыдущего поиска
    tvShowsHead.textContent = '';
    tvShowsList.textContent = '';
  }
});




// открытие модального окна
tvShowsList.addEventListener('click', event => {
  // прелоудер для модального окна
  preloader.style.display = 'block';

  event.preventDefault();

  const target = event.target;
  const card = target.closest('.tv-card');
  if (card) {
    // сначала сделаем запрос, что бы заполнить модальное окно ===then- обрабатывает promice
    new DBService().getTvShow(card.id)
      .then(response => {//response - называю сама, это ответ от сервера
        console.log('response: ', response);
        const posterPath = response.poster_path;
        // если у модального окна нет пути для подгрузки картинки, то я скрываю блок с картинкой что бы небыло пустого места
        if (posterPath) {
          tvCardImg.src = IMG_URL + posterPath;
          tvCardImg.alt = response.name;
          posterWrapper.style.display = 'block';
          modalContent.style.paddingLeft = '';
        } else {
          posterWrapper.style.display = 'none';
          modalContent.style.paddingLeft = '25px';
        }

        modalTitle.textContent = response.name;
        // перебираю данные жанров в ответе от сервера (они в массиве)
        // genresList.innerHTML = response.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, ''); ИЛИ
        genresList.textContent = '';
        for (const item of response.genres) {
          genresList.innerHTML += `<li>${item.name}</li>`;
        }
        rating.textContent = response.vote_average;
        description.textContent = response.overview;
        modalLink.href = response.homepage;
      })
      // показываю модальное окно
      .then(() => {
        // убираю бегунок прокрутки из body у модального окна
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
      })
      // убираю прелоудер finally - сработает только в том случае если отработают все then()
      .finally(() => {
        preloader.style.display = 'none';
      })

  }
})

// закрытие модального окна
modal.addEventListener('click', event => {

  if (event.target.closest('.cross') || event.target.classList.contains('modal')) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
});

// смена bg кароточки
const changeImage = event => {

  const card = event.target.closest('.tv-shows__item');

  if (card) {
    const img = card.querySelector('.tv-card__img');
    const otherImg = img.dataset.backdrop;
    // защита если есть дополнительная картинка для бэкграунда, то при наведении меняем ее
    if (otherImg) {
      img.dataset.backdrop = img.src;
      img.src = otherImg;
    }


  }
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  
  if (target.classList.contains('pages')){
    tvShows.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard);
  }
});