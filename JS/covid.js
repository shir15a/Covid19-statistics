const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';
const DataCountries = 'http://corona-api.com/countries';
const allTheCountries = 'https://restcountries.herokuapp.com/api/v1';

// querySelector's
const worldClick = document.querySelector(".world")
const popuptext = document.querySelector(".popuptext")
const chooseTypeDiv = document.querySelector(".choose-type")
const popup = document.querySelector("#myPopup");
const spinner = document.querySelector(".spinner")
const chart = document.querySelector(".chart")

let chosenDataType = 'recovered';
let chosenRegion = 'world';


// create select drop down
let dropDown = document.createElement("SELECT");
dropDown.classList.add("dropDown")


// when load the page world recovered is the default
window.addEventListener("load", () => {
    countriesData('recovered')
});

// foreach data types buttons
const dataTypesButtons = document.querySelectorAll('.btn-data-type')
for (button of dataTypesButtons) {
    button.addEventListener('click', (element) => {
        popup.classList.remove("show")
        chosenDataType = element.target.name
        if(chosenRegion!='world'){
            countriesInformation(chosenDataType, chosenRegion)
        }
        countriesData(element.target.name)
    })
}

// foreach region buttons
const regionButtons = document.querySelectorAll('.btn-region')
for (button of regionButtons) {
    button.addEventListener('click', (element) => {
        popup.classList.remove("show")
        chosenRegion = element.target.name
        countriesInformation(chosenDataType, chosenRegion)
    })
}

worldClick.addEventListener('click', () => {
    popup.classList.remove("show")
    countriesData(chosenDataType, 'world')
})


// create new chart => gets: countriesNames - arr with all countries names
// numberArr - arr with data numbers
// type - confirmed/deaths/ recovered/ critical
function creatNewChart(countriesNames, numberArr, type, region) {
    var ctx = document.getElementById('myChart').remove();
    let newC = document.createElement("canvas");
    newC.id = 'myChart';
    chart.appendChild(newC)
    var ctx =  document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: countriesNames,
            datasets: [{
                label: `${type} in ${region}`, //מה שרשום למעלה
                data: numberArr,
                backgroundColor: "#E0EAEC",
                borderColor: "#2099BA",
                borderWidth: "1"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    return myChart
}


// create country data : name, deaths number.....
function createCountryData(countryObj) {
    if (!countryObj) {
        return
    }
    return {
        name: countryObj.name,
        deaths: countryObj.latest_data.deaths,
        confirmed: countryObj.latest_data.confirmed,
        critical: countryObj.latest_data.critical,
        recovered: countryObj.latest_data.recovered,
        todayConfirmed: countryObj.today.confirmed,
        todayDeaths: countryObj.today.deaths
    }
}

// // // type = recovered/deaths.........
// find the data of the country by its code
async function countriesData(type, continent) {
    const country = `${proxy}${DataCountries}`;
    const response = await fetch(country);
    const data = await response.json();
    countryArr = []
    if (continent && !(continent === 'world')) {
        countryArr = continent.map((countryCode) => {
            const c = data.data.find(x => x.code === countryCode)
            return createCountryData(c)
        })
    }
    else {
        countryArr = data.data.map((country) => createCountryData(country))
    }

    // make the countriesNamesArr and countriesNumArr for creatNewChart func
    let countriesNamesArr = [];
    let countriesNumArr = [];
    for (let i = 0; i < countryArr.length; i++) {
        if (countryArr[i]) {
            countriesNamesArr.push(countryArr[i].name)
            countriesNumArr.push(countryArr[i][type])
        }
    }
    if (continent === 'world') chosenRegion = 'world'
    creatNewChart(countriesNamesArr, countriesNumArr, type, chosenRegion)
}

// countriesData();

function countryCodeAndRegion(cou) {
    return {
        name: cou.name.common,
        region: cou.region,
        code: cou.cca2
    }
}

//countries information without covid information
async function countriesInformation(type, continent) {
    const response = await fetch(proxy + allTheCountries);
    const data = await response.json();
    countries = data.map((country) => countryCodeAndRegion(country))
    const continentArr = countries.reduce((acc, { region, code }) => {
        if (region === continent)
            acc.push(code)
        return acc
    }, [])
    countriesData(type, continentArr)
}

// create drop down with all countries 
async function createDropDown() {
    let option = document.createElement("option");
    option.innerHTML = '-- Select a Country --'
    dropDown.appendChild(option)
    const basePoint = `${proxy}${DataCountries}`;
    const response = await fetch(basePoint);
    const data = await response.json();
    console.log("data", data);
    data.data.forEach((countryObj) => {
        let optionSelect = document.createElement("option");
        optionSelect.innerHTML = countryObj.name;
        dropDown.appendChild(optionSelect)
    })
    chooseTypeDiv.appendChild(dropDown)
}

// when choose a country this func create all data of the country
dropDown.addEventListener('change', async () => {
    const basePoint = `${proxy}${DataCountries}`;
    const response = await fetch(basePoint);
    const data = await response.json();
    console.log("data", data);
    let selected_text = dropDown.value;
    console.log(selected_text);
    const cObj = data.data.find(x => x.name === selected_text)
    const countryDataObj = createCountryData(cObj)
    console.log("nnn", countryDataObj);
    popup.classList.add("show");
    const popUpData = `
        <h2>${countryDataObj.name}</h2>
        <div>
        <h6>Total Confirmed Cases: 
            <p>${countryDataObj.confirmed}</p>
        </h6>
        <h6>Total Critical Cases: 
            <p>${countryDataObj.critical}</p>
        </h6>
        <h6>Total Deaths: 
            <p>${countryDataObj.deaths}</p>
        </h6>
        <h6>Total Recovered: 
            <p>${countryDataObj.recovered}</p>
        </h6>
        <h6>New Confirmed Cases: 
            <p>${countryDataObj.todayConfirmed}</p>
        </h6>
        <h6>New Deaths: 
            <p>${countryDataObj.todayDeaths}</p>
        </h6>
        </div>`;
    popuptext.innerHTML = popUpData;
})

createDropDown()
