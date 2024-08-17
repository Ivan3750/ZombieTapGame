const user = window.Telegram.WebApp.initDataUnsafe;
const inviteBtn = document.querySelector('.invite-btn');
const friendsAmount = document.querySelector('.friends-amount');
const friendsText = document.querySelector('.friends-text');
const friendsBlock = document.querySelector('.friends-block');
inviteBtn.addEventListener("click", () => {
    const textToCopy = `https://t.me/ZombieTapTest_bot?start=${user.user.id}`;
});


fetch(`api/user/${user.user.id}/ref`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      "Content-Type": "application/json",
    }})
.then(res => res.json())
.then((data)=>{
    console.log(data)
    friendsAmount.innerHTML = data.referrals.length
    if(data.referrals.length > 1){
        friendsText.innerHTML = "Friends"
    }else{
        friendsText.innerHTML = "Friend"
    }
    friendsBlock.innerHTML = ""
    data.referrals.forEach(refferral => {
        friendsBlock.innerHTML += `<div class="friends-box">
    <div class="friends-icon-box">
            <img src="../../assets/sprites/friends/${Math.round(Math.random()*3)}.png" alt="" class="friends-icon">

    </div>
    <div class="friends-info">
        <p class="friends-name">${refferral.referred_user_name}</p>
    </div>
<div class="friends-reward-box">
      <p class="friends-reward-amount">600</p>
      <img src="../../assets/icons/coin.png" class="coin-icon" alt="">
    </div>`
    });
})
.catch((err)=>{
    console.error(err)
    friendsBlock.innerHTML += ` <div class="friends-box">
          <p class="friends-nothing-text">You have no friends</p>
        </div>`
        friendsAmount.innerHTML = 0
        friendsText.innerHTML = "Friends"
})

