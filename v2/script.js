const apiKeyNASA = "ETcv7le1WZxSCmiKJKoq3VIlAQTYjywilNTDpuRF"; // Ваш API-ключ NASA
const nasaBaseUrl = "https://api.nasa.gov/planetary/earth/assets";
const openMeteoBaseUrl = "https://api.open-meteo.com/v1/forecast"; // Пример API для получения данных о погоде
const input = document.getElementById("location-input");
const button = document.getElementById("search-button");
const loader = document.getElementById("loader"); // Индикатор загрузки

button.onclick = function () {
    input.classList.toggle("visible"); // Переключаем класс для анимации
};

// Убираем инпут при клике вне него
document.addEventListener("click", function (event) {
    const isClickInside = input.contains(event.target) || button.contains(event.target);
    if (!isClickInside) {
        input.classList.remove("visible");
    }
});

document.getElementById("btn").onclick = async function () {
    // Увеличение модели Земли
    const modelViewer = document.getElementById("cl");
    modelViewer.style.transform = "translate(-6%, 15%)";
    modelViewer.style.width = "225%";
    modelViewer.style.height = "225%";
    document.getElementById("container").style.display = "block";

    // Проверка локации
    if (input.value === "Каспийское Озеро") {
        alert("КРАСАВЧИК");
        modelViewer.setAttribute("camera-target", "42.00 51.00 0");
        modelViewer.setAttribute("camera-orbit", "180deg 30deg 1000px");
    }

    const cont = document.getElementById("container");

    // Удаляем существующие элементы
    while (cont.firstChild) {
        cont.removeChild(cont.firstChild);
    }

    const date = new Date();
    const currentYear = date.getFullYear();

    // Создаем блок для текущего года
    const currentYearDataBlock = document.createElement("div");
    currentYearDataBlock.className = "block";
    currentYearDataBlock.id = "currentYearDataBlock";
    cont.appendChild(currentYearDataBlock);

    // Создаем поле ввода для выбора года
    const yearInput = document.createElement("input");
    yearInput.type = "number";
    yearInput.min = 1900;
    yearInput.max = 2100;
    yearInput.value = currentYear; // Устанавливаем начальное значение на текущий год
    cont.appendChild(yearInput);

    // Создаем кнопку для получения данных
    const getDataButton = document.createElement("button");
    getDataButton.textContent = "Получить данные";
    cont.appendChild(getDataButton);

    // Создаем контейнер для блоков сравнения
    const comparisonContainer = document.createElement("div");
    comparisonContainer.className = "comparison-container";
    cont.appendChild(comparisonContainer);

    // Блок для выбранного года
    const selectedDataBlock = document.createElement("div");
    selectedDataBlock.className = "comparison-block";
    selectedDataBlock.id = "selectedDataBlock";
    selectedDataBlock.innerHTML = `<strong>Выбранный год:</strong><br>Температура: -- °C`;
    comparisonContainer.appendChild(selectedDataBlock);

    // Блок для сравнения
    const comparisonBlock = document.createElement("div");
    comparisonBlock.className = "comparison-block";
    comparisonBlock.id = "comparisonBlock";
    comparisonBlock.innerHTML = `<strong>Сравнение температур:</strong><br>Разница: -- °C`;
    comparisonContainer.appendChild(comparisonBlock);

    // Функция для получения данных NASA и Open-Meteo
    async function fetchRealTemperatureData(selectedYear) {
        const lat = 41.8369; // Широта Каспийского моря (пример)
        const lon = 50.0848; // Долгота Каспийского моря (пример)
        const date = `${selectedYear}-12-31`; // Используем выбранный год в формате ГГГГ-ММ-ДД

        try {
            // Получаем данные с NASA
            const nasaResponse = await fetch(`${nasaBaseUrl}?lon=${lon}&lat=${lat}&date=${date}&dim=0.1&api_key=${apiKeyNASA}`);
            const openMeteoResponse = await fetch(`${openMeteoBaseUrl}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);

            let nasaData = await nasaResponse.json();
            let openMeteoData = await openMeteoResponse.json();

            console.log("Данные NASA:", nasaData);
            console.log("Данные Open-Meteo:", openMeteoData);

            const realTempNASA = nasaData?.data?.[0]?.some_temperature_field || null; // Используйте корректное поле для температуры
            const realTempMeteo = openMeteoData.current_weather.temperature || null;

            return { nasa: realTempNASA, openMeteo: realTempMeteo };
        } catch (error) {
            console.error("Ошибка получения данных от NASA или Open-Meteo:", error);
            return { nasa: null, openMeteo: null }; // Если ошибка, выводим null
        }
    }

    // Функция для обновления температуры в интерфейсе
    async function updateTemperature(selectedYear) {
        if (selectedYear < 1900 || selectedYear > 2100) {
            alert("Нет данных для этого года. Пожалуйста, выберите год от 1900 до 2100.");
            return; // Завершить выполнение функции, если год вне допустимого диапазона
        }

        loader.style.display = "block"; // Показываем индикатор загрузки

        const realTemperatureData = await fetchRealTemperatureData(selectedYear);
        const currentTemperatureData = await fetchRealTemperatureData(currentYear);
        
        loader.style.display = "none"; // Скрываем индикатор загрузки

        // Обновляем данные для текущего года
        currentYearDataBlock.innerHTML = `
            <strong>Текущий год (${currentYear}):</strong><br>
            <em>Данные NASA:</em> ${currentTemperatureData.nasa !== null ? currentTemperatureData.nasa + "°C" : "Нет данных"}<br>
            <em>Данные Open-Meteo:</em> ${currentTemperatureData.openMeteo !== null ? currentTemperatureData.openMeteo + "°C" : "Нет данных"}
        `;

        // Обновляем данные для выбранного года
        selectedDataBlock.innerHTML = `
            <strong>Выбранный год (${selectedYear}):</strong><br>
            <em>Данные NASA:</em> ${realTemperatureData.nasa !== null ? realTemperatureData.nasa + "°C" : "Нет данных"}<br>
            <em>Данные Open-Meteo:</em> ${realTemperatureData.openMeteo !== null ? realTemperatureData.openMeteo + "°C" : "Нет данных"}
        `;

        // Сравнение температур
        const currentTemp = parseFloat(currentTemperatureData.openMeteo);
        const selectedTemp = parseFloat(realTemperatureData.nasa);

        if (!isNaN(currentTemp) && !isNaN(selectedTemp)) {
            const difference = (currentTemp - selectedTemp).toFixed(2);
            comparisonBlock.innerHTML = `<strong>Сравнение температур:</strong><br>Разница: ${difference}°C`;
        } else {
            comparisonBlock.innerHTML = `<strong>Сравнение температур:</strong><br>Разница: Нет данных`;
        }
    }

    // Обработка нажатия кнопки
    getDataButton.onclick = async function () {
        const selectedYear = parseInt(yearInput.value);
        await updateTemperature(selectedYear); // Обновляем температуру при нажатии кнопки
    };

    // Начальное обновление температуры для текущего года
    await updateTemperature(currentYear);
};
