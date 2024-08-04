const zombie = document.querySelector('.avatar');
const playBtn = document.querySelector('.play-btn');



const waitTime = 0 //TEST


window.addEventListener("load", ()=>{
    if(waitTime == 0){
        playBtn.classList.add("active")
    }else{
        playBtn.classList.remove("active")
    }
})

playBtn.addEventListener("click", ()=>{
    if(waitTime == 0){
        playBtn.classList.add("active")
    }else{
        playBtn.classList.remove("active")
    }

    if(playBtn.classList.contains("active")){
        window.location.href = "../pages/game.html"
    }
})




window.addEventListener("load", () => {
    let i = 1;
    const interval = setInterval(() => {
        zombie.src = `../../assets/sprites/1/Idle 1 (${i}).png`; // Adjust to the actual path of the images
        i++;
        if (i > 10) i = 1;
    }, 125); // Adjust the interval time as needed
});
