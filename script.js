// WeatherAPI.com API 키 - 실제 사용시에는 본인의 API 키로 교체하세요
const API_KEY = '07c5045c3ee5483484d22625251007'; // WeatherAPI.com에서 발급받은 API 키를 입력하세요
const BASE_URL = 'https://api.weatherapi.com/v1';

// 한글 도시명 → 영문 도시명 매핑
const KOREAN_CITY_MAP = {
    '서울': 'Seoul',
    '부산': 'Busan',
    '대구': 'Daegu',
    '인천': 'Incheon',
    '광주': 'Gwangju',
    '대전': 'Daejeon',
    '울산': 'Ulsan',
    '수원': 'Suwon',
    '고양': 'Goyang',
    '용인': 'Yongin',
    '성남': 'Seongnam',
    '창원': 'Changwon',
    '청주': 'Cheongju',
    '전주': 'Jeonju',
    '천안': 'Cheonan',
    '안산': 'Ansan',
    '안양': 'Anyang',
    '남양주': 'Namyangju',
    '평택': 'Pyeongtaek',
    '의정부': 'Uijeongbu',
    '파주': 'Paju',
    '김해': 'Gimhae',
    '제주': 'Jeju',
    '포항': 'Pohang',
    '여수': 'Yeosu',
    '순천': 'Suncheon',
    '경주': 'Gyeongju',
    '강릉': 'Gangneung',
    '춘천': 'Chuncheon',
    '원주': 'Wonju',
    '아산': 'Asan',
    '익산': 'Iksan',
    '구미': 'Gumi',
    '진주': 'Jinju',
    '충주': 'Chungju',
    '목포': 'Mokpo',
    '군산': 'Gunsan',
    '김천': 'Gimcheon',
    '속초': 'Sokcho',
    '동해': 'Donghae',
    '삼척': 'Samcheok',
    '서귀포': 'Seogwipo',
};

// DOM 요소들
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const visibility = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast-container');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');

// 이벤트 리스너 등록
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// 입력 필드 포커스시 도시명 제안
cityInput.addEventListener('focus', () => {
    if (!cityInput.value.trim()) {
        cityInput.placeholder = '예: Seoul, Tokyo, New York, London...';
    }
});

// 입력 필드 블러시 원래 플레이스홀더로 복원
cityInput.addEventListener('blur', () => {
    cityInput.placeholder = '도시명을 입력하세요...';
});

// 페이지 로드시 서울 날씨 표시
window.addEventListener('load', () => {
    getWeather('Seoul');
});

// 날씨 정보 가져오기
async function getWeather(city = null) {
    let searchCity = city || cityInput.value.trim();

    // 한글 도시명 입력시 영문으로 변환 + 한국 도시면 국가명 추가
    if (KOREAN_CITY_MAP[searchCity]) {
        searchCity = KOREAN_CITY_MAP[searchCity] + ', South Korea';
    }
    
    if (!searchCity) {
        showError('도시명을 입력해주세요.');
        return;
    }

    showLoading();
    hideError();

    try {
        // 현재 날씨 정보 가져오기
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(searchCity)}&aqi=no`
        );

        const currentWeatherData = await currentWeatherResponse.json();

        // API 에러 체크 (WeatherAPI.com은 도시를 찾을 수 없어도 200 응답을 반환)
        if (currentWeatherData.error) {
            let errorMessage = '도시를 찾을 수 없습니다.';
            if (currentWeatherData.error.code === 1006) {
                errorMessage = '도시명을 정확히 입력해주세요. (예: 서울/Seoul, 부산/Busan, New York)';
            } else if (currentWeatherData.error.message) {
                errorMessage = currentWeatherData.error.message;
            }
            throw new Error(errorMessage);
        }

        // 시간별 예보 정보 가져오기
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(searchCity)}&days=1&aqi=no`
        );

        const forecastData = await forecastResponse.json();

        // 예보 API 에러 체크
        if (forecastData.error) {
            let errorMessage = '예보 정보를 가져올 수 없습니다.';
            if (forecastData.error.code === 1006) {
                errorMessage = '도시명을 정확히 입력해주세요. (예: 서울/Seoul, 부산/Busan, New York)';
            } else if (forecastData.error.message) {
                errorMessage = forecastData.error.message;
            }
            throw new Error(errorMessage);
        }

        // UI 업데이트
        updateCurrentWeather(currentWeatherData);
        updateForecast(forecastData);
        hideLoading();

    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

// 현재 날씨 정보 업데이트
function updateCurrentWeather(data) {
    const location = data.location;
    const current = data.current;

    // 위치 정보
    cityName.textContent = `${location.name}, ${location.country}`;
    
    // 날짜와 시간
    const localTime = new Date(location.localtime);
    dateTime.textContent = localTime.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 온도
    temperature.textContent = `${Math.round(current.temp_c)}°C`;
    
    // 날씨 설명
    weatherDescription.textContent = current.condition.text;
    
    // 날씨 아이콘
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;

    // 상세 정보
    feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${Math.round(current.wind_kph)} km/h`;
    visibility.textContent = `${current.vis_km} km`;

    // 배경색 업데이트
    updateBackgroundColor(current.condition.code);
}

// 시간별 예보 업데이트
function updateForecast(data) {
    const forecastHours = data.forecast.forecastday[0].hour;
    
    // 현재 시간부터 24시간 예보 표시
    const currentHour = new Date().getHours();
    const futureHours = forecastHours.filter((hour, index) => index >= currentHour).slice(0, 8);
    
    forecastContainer.innerHTML = '';

    futureHours.forEach(hourData => {
        const hour = new Date(hourData.time).getHours();
        const temp = Math.round(hourData.temp_c);
        const icon = hourData.condition.icon;
        const condition = hourData.condition.text;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="time">${hour}:00</div>
            <img class="forecast-icon" src="https:${icon}" alt="${condition}">
            <div class="forecast-temp">${temp}°C</div>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

// 로딩 상태 표시
function showLoading() {
    loading.classList.add('active');
    document.querySelector('.weather-content').style.display = 'none';
}

// 로딩 상태 숨기기
function hideLoading() {
    loading.classList.remove('active');
    document.querySelector('.weather-content').style.display = 'block';
}

// 에러 표시
function showError(message) {
    errorMessage.textContent = message;
    error.classList.add('active');
    document.querySelector('.weather-content').style.display = 'none';
}

// 에러 숨기기
function hideError() {
    error.classList.remove('active');
    document.querySelector('.weather-content').style.display = 'block';
}

// 날씨 아이콘에 따른 배경색 변경
function updateBackgroundColor(weatherCode) {
    const body = document.body;
    
    // WeatherAPI.com의 날씨 코드에 따른 배경색 설정
    const weatherColors = {
        '1000': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 맑음
        '1003': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // 구름 조금
        '1006': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // 구름 많음
        '1009': 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', // 흐림
        '1030': 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', // 안개
        '1063': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 비
        '1066': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 눈
        '1069': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 비와 눈
        '1087': 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', // 천둥번개
        '1135': 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', // 안개
        '1147': 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', // 짙은 안개
        '1150': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 이슬비
        '1153': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 이슬비
        '1168': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 이슬비
        '1171': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 강한 이슬비
        '1180': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 비
        '1183': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 비
        '1186': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 비
        '1189': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 비
        '1192': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 강한 비
        '1195': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 매우 강한 비
        '1198': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 비
        '1201': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 비
        '1204': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 눈
        '1207': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 눈
        '1210': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 눈
        '1213': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 눈
        '1216': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 눈
        '1219': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 눈
        '1222': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 강한 눈
        '1225': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 매우 강한 눈
        '1237': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 얼음 알갱이
        '1240': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 비
        '1243': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 비
        '1246': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 강한 비
        '1249': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 비와 눈
        '1252': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 비와 눈
        '1255': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 강한 비와 눈
        '1261': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 가벼운 얼음 알갱이
        '1264': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // 얼음 알갱이
        '1273': 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', // 가벼운 천둥번개
        '1276': 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', // 천둥번개
    };

    const color = weatherColors[weatherCode] || weatherColors['1000'];
    body.style.background = color;
}

 