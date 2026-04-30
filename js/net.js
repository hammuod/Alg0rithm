const onnet = document.querySelector(".nonet")
const yesnet = document.querySelector(".yesnet")

if (onnet && yesnet) {
    if(navigator.onLine){
        online()
    }else{
        offline()
    }
}

window.addEventListener('online', function(){
    if (onnet && yesnet) online()
})

window.addEventListener('offline', function(){
    if (onnet && yesnet) offline()
})

function online(){
    if (!onnet || !yesnet) return;
    onnet.classList.add('hide');
    yesnet.classList.remove('hide');
}

function offline(){
    if (!onnet || !yesnet) return;
    yesnet.classList.add('hide');
    onnet.classList.remove('hide');
}


const btn = document.getElementById('dark-mode-toggle');

if (btn) {
    if(localStorage.getItem("theme") == "dark"){
        document.body.classList.add("dark-mode")
    }else{
        document.body.classList.remove("dark-mode")
    };

    btn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };
}