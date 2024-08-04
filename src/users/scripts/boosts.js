document.querySelectorAll('.upgrade-box').forEach(box => {
    box.addEventListener('click', () => {
        upgrade(box);
    });
});
console.log(1);

function upgrade(box) {
    const id = box.id;
    const priceElement = box.querySelector('.price-amount');
    const levelElement = box.querySelector('.upgrade-level');
    const amountElement = box.querySelector('.upgrade-amount');
    
    let price = parseInt(priceElement.innerText);
    let level = parseInt(levelElement.innerText.split(' ')[0]);
    let amount = amountElement.innerText;
    
    if (id === 'multitap-box' && level < 100) {
        level++;
        price = Math.round(price * 1.25);
        amount = `${level} $ZB`;
    } else if (id === 'regeneration-box' && level < 10) {
        level++;
        price = Math.round(price * 1.25);
        amount = `${168 + 12 * (level - 1)}s`;
    } else if (id === 'hurtlimit-box' && level < 100) {
        level++;
        price = Math.round(price * 1.25);
        amount = `${level} hurt`;
    } else if (id === 'hurtlimit-box' && level === 100 || id === 'multitap-box' && level === 100) {
        price = "MAX";
    } else if (id === 'regeneration-box' && level === 10) {
        price = "MAX";
    }

    priceElement.innerText = price;
    levelElement.innerText = `${level} lvl`;
    amountElement.innerText = amount;
}

