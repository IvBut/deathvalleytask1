import {Map} from './environment';
import '../css/main.css'
import json from '../data';

const modal = document.querySelector('.modal-wrapper');
const modalContent = document.querySelector('.modal-content');
const modalCaption = document.querySelector('.modal-caption');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('mainForm');
const snackbar = document.querySelector('.user-message');

let map;

class DataLoader {
    static async getAllData(){
        try {
            let result = await fetch('./data.json');
            let data = await result.json();
            return data
        } catch(e){
            console.log(e);
        }
    }
}

class DataStorage {
    static saveData(data){
        localStorage.setItem('data',JSON.stringify(data));
    }

    static getAllFeaturedWorks(){
        return localStorage.getItem('data')? JSON.parse(localStorage.getItem('data'))['featured-works']: [];
    }

    static getTeamMembers(){
        return localStorage.getItem('data')? JSON.parse(localStorage.getItem('data'))['team']: [];
    }

    static getWorkById(id) {
        let films = JSON.parse(localStorage.getItem('data'))['featured-works']; 
        return films.find(item => {return item.id === id});
    }
}

class UI {
    displayFeaturedWorks() {
        let workList = DataStorage.getAllFeaturedWorks();
        if (workList.length > 0){
            let worksWrapper = document.querySelector('.works-wrapper');
            workList.forEach(element => {
                let img = document.createElement('div');
                img.classList.add('work-img');
                img.style.backgroundImage = `url('${element.url}')`;
                img.setAttribute('data-id', element.id);
                
                let imgWrapper = document.createElement('div');
                imgWrapper.classList.add('work-img-container');
                imgWrapper.appendChild(img);

                worksWrapper.appendChild(imgWrapper);

            });
        } 
    }

    displayTeamMembers(){
        let teamList = DataStorage.getTeamMembers();
        if (teamList.length > 0) {
            let teamWrapper = document.querySelector('.team-wrapper');
            let result = '';
            teamList.forEach(member => {
                result += `                    
                <div class="img-team-container" data-id="${member.id}">
                <img src="${member.photo}" alt="${member.name}" class="img-team">
                <div class="team-info-overlay">
                    <div class="team-info-header">
                        <h4>${member.name}</h4>
                        <span class="team-member-role">/${member.role}</span>
                    </div>
                    <p class="team-member-details">${member.info}</p>
                    <div class="team-socialmedia-wrapper">
                        <i class="fa fa-facebook-f team-socialmedia"></i>
                        <i class="fa fa-twitter team-socialmedia"></i>
                        <i class="fa fa-dribbble team-socialmedia"></i>
                        <i class="fa fa-envelope team-socialmedia"></i>
                    </div>
                </div>
            </div>`;
            });
            teamWrapper.innerHTML = result;
        }
    }

    addWorksClickHandlers(){
        let works = [...document.querySelectorAll('.work-img-container')];
        works.forEach(item => {
            item.addEventListener('click',(event)=>{
                showPopup(+event.target.dataset['id']);
            });
        })
    }

}


class UserMessageService extends EventTarget{
    sendMessage(msg, type){
        this.dispatchEvent(new CustomEvent('userMessage',{
            detail : {
                msg, type
            }
        }))
    }
}

let userMessage = new UserMessageService();
userMessage.addEventListener('userMessage', (data)=>{
    let {msg, type} = {...data.detail};
    snackbar.textContent = msg;
    if (type === 'success'){
        snackbar.style.backgroundColor = 'green';
    } else {
        snackbar.style.backgroundColor = 'red';
    }
    snackbar.style.visibility = 'visible';
    setTimeout(()=>{
        snackbar.style.visibility = 'hidden';
    },5000)

});


function showPopup(id){
   let work = DataStorage.getWorkById(id);
   modalContent.setAttribute('src', work.url);
   modalCaption.textContent = work.name;
   modal.classList.remove('hideModal');
}

function hideModal(){
    modal.classList.add('hideModal');
}

function InitMap() {
    let sc = document.createElement('script');
    document.head.appendChild(sc);
    
    sc.addEventListener("load", () =>{
        let center = {lat: 53.669353, lng: 23.813131};
        map = new google.maps.Map(document.getElementById('map'), {
          zoom : 14,
          center  
        })

        let marker = new google.maps.Marker({
            position: {lat:53.68376524, lng: 23.83331001},
            map
        });

        let infoWindow = new google.maps.InfoWindow({
            content: `<h1>Death Valley </h1>`
        });

        marker.addListener('click', () => infoWindow.open(map,marker));
    })
    sc.src = `https://maps.googleapis.com/maps/api/js?key=${Map.apikey}`
}

function handleSubmit(event) {
    event.preventDefault();
    let inputs = Array.from(form.querySelectorAll('.form-control'));
    inputs.forEach(inp => inp.value = '');
    userMessage.sendMessage('Your message has been sent. We will respond as soon as possible', 'success');

}



document.addEventListener('DOMContentLoaded',()=>{
    closeBtn.addEventListener('click', hideModal);
    form.addEventListener('submit', handleSubmit);
    InitMap();
    DataStorage.saveData(json);
    let ui = new UI();
    ui.displayFeaturedWorks();
    ui.addWorksClickHandlers();
    ui.displayTeamMembers();
});
