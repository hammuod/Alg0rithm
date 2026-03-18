import { SpeedInsights } from "@vercel/speed-insights"
const onnet = document.querySelector(".nonet")
const yesnet = document.querySelector(".yesnet")

if(navigator.onLine){
    online()
}else{
    offline()
}

window.addEventListener('online', function(){
    online()
})

window.addEventListener('offline', function(){
    offline()
})

function online(){
    onnet.classList.add('hide');
    yesnet.classList.remove('hide');
}

function offline(){
    yesnet.classList.add('hide');
    onnet.classList.remove('hide');
}

new SpeedInsights().observe();