const apiKey = 'mDEh90ZjxDEdam9BgkXmhme58niNm7heUtJxGUDI'; // Замените на ваш API ключ
const endpoint = 'https://api.nasa.gov/planetary/earth/assets';

// Список мест в Южной Америке с координатами
const locations = {
    'Туркменистан': { lat: 37.862499, lon: 58.238056 },
    'Таджикистан': { lat: 38.559700, lon: 68.787000 },
    'Казахстан': { lat: 43.238949, lon: 76.889709 }
};

// Обработчик для кнопки
document.getElementById('fetch-data').addEventListener('click', fetchLandsatData);
document.getElementById('location-input').addEventListener('input', showSuggestions);

// Функция для получения данных Landsat
async function fetchLandsatData() {
    const locationName = document.getElementById('location-input').value;
    const location = locations[locationName];

    if (!location) {
        document.getElementById('results').innerText = 'Пожалуйста, выберите местность из предложений.';
        return;
    }

    const { lat, lon } = location;
    const date = '2024-05-10'; // Пример даты

    const url = `${endpoint}?lat=${lat}&lon=${lon}&date=${date}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.status);
        }
        const data = await response.json();
        displayResults(data);
        console.log(data);
        // url - картинка, 
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        document.getElementById('results').innerText = 'Ошибка при получении данных.';
    }
}

// Функция для отображения результатов
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (data.url) {
        const img = document.createElement('img');
        const imgPath = String(data.url);
        img.src = imgPath,
        img.alt = 'Изображение Landsat 9';
        img.style.width = '100%';
        img.onmouseenter = zoom(img),
        resultsDiv.appendChild(img);
    function zoom(img){
        img.width *= 10;
    }
    } else {
        resultsDiv.innerText = 'Нет доступных данных для отображения.';
    }

    // Пример текстовой информации об изменениях ландшафта
    const info = document.createElement('p');
    info.innerText = 'Информация об изменениях ландшафта: ';
    resultsDiv.appendChild(info);
}

// Функция для отображения предложений
function showSuggestions() {
    const input = document.getElementById('location-input');
    const value = input.value.toLowerCase();
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';

    if (value) {
        const filteredSuggestions = Object.keys(locations).filter(suggestion => 
            suggestion.toLowerCase().startsWith(value)
        );

        if (filteredSuggestions.length) {
            suggestionsDiv.style.display = 'block';
            filteredSuggestions.forEach(suggestion => {
                const div = document.createElement('div');
                div.className = 'suggestion';
                div.innerText = suggestion;
                div.onclick = () => {
                    input.value = suggestion;
                    suggestionsDiv.style.display = 'none';
                };
                suggestionsDiv.appendChild(div);
            });
        } else {
            suggestionsDiv.style.display = 'none';
        }
    } else {
        suggestionsDiv.style.display = 'none';
    }
}


// Код для вращающейся модели Земли
const earth = document.querySelector('.earth');
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

earth.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    earth.style.animation = 'none'; // Останавливаем анимацию
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    earth.style.transform = `rotateY(${deltaX}deg)`;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    earth.style.animation = 'rotate 10s linear infinite'; // Возвращаем анимацию
});