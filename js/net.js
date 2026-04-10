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


const btn = document.getElementById('dark-mode-toggle');

if(localStorage.getItem("theme") == "dark"){
    document.body.classList.add("dark-mode")
}else{
    document.body.classList.remove("dark-mode")
};

btn.onclick = () => {
    document.body.classList.toggle('dark-mode');

    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};