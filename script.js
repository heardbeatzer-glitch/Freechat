let isGhostMode = false;
let activeContact = null;
let isLoginMode = false; // Standaard op 'Aanmelden'

// DATABASE SIMULATIE
// We slaan alle accounts op in 'freechat_accounts'
let accounts = JSON.parse(localStorage.getItem('freechat_accounts')) || {};
// We houden bij wie er NU is ingelogd
let currentUser = JSON.parse(localStorage.getItem('freechat_current_session')) || null;
let chatHistory = JSON.parse(localStorage.getItem('freechat_history')) || {};

window.onload = function() {
    if (currentUser) {
        showChatInterface();
        renderContacts();
    }
};

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-title');
    const desc = document.getElementById('auth-desc');
    const btn = document.getElementById('main-auth-btn');
    const link = document.getElementById('switch-link');
    const text = document.getElementById('switch-text');
    const nameInput = document.getElementById('username');

    if (isLoginMode) {
        title.innerText = "Inloggen";
        desc.innerText = "Voer je gegevens in om verder te gaan";
        btn.innerText = "Inloggen";
        text.innerText = "Nog geen account?";
        link.innerText = "Aanmelden";
        nameInput.style.display = "none"; // Naam is niet nodig bij inloggen, alleen nummer
    } else {
        title.innerText = "Aanmelden";
        desc.innerText = "Maak een nieuw FreeChat account aan";
        btn.innerText = "Account Aanmaken";
        text.innerText = "Heb je al een account?";
        link.innerText = "Inloggen";
        nameInput.style.display = "block";
    }
}

function handleAuth() {
    const name = document.getElementById('username').value.trim();
    const number = document.getElementById('usernumber').value.trim();

    if (number === "") return alert("Vul een nummer in!");

    if (isLoginMode) {
        // INLOGGEN
        if (accounts[number]) {
            currentUser = { name: accounts[number], number: number };
            localStorage.setItem('freechat_current_session', JSON.stringify(currentUser));
            showChatInterface();
            renderContacts();
        } else {
            alert("Dit nummer bestaat niet. Meld je eerst aan!");
        }
    } else {
        // AANMELDEN
        if (name === "") return alert("Vul je naam in!");
        if (accounts[number]) return alert("Dit nummer is al bezet!");

        accounts[number] = name;
        localStorage.setItem('freechat_accounts', JSON.stringify(accounts));
        
        currentUser = { name: name, number: number };
        localStorage.setItem('freechat_current_session', JSON.stringify(currentUser));
        
        showChatInterface();
        renderContacts();
    }
}

function showChatInterface() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('display-name').innerText = `${currentUser.name} (${currentUser.number})`;
}

function logout() {
    localStorage.removeItem('freechat_current_session');
    location.reload();
}

// ... (Houd de functies addContact, sendMessage, renderMessages en saveToStorage van de vorige versie) ...

function addContact() {
    const contactInput = document.getElementById('new-contact');
    const number = contactInput.value.trim();
    if (number !== "" && !chatHistory[number]) {
        chatHistory[number] = [];
        localStorage.setItem('freechat_history', JSON.stringify(chatHistory));
        renderContacts();
        contactInput.value = "";
    }
}

function renderContacts() {
    const list = document.getElementById('contact-list');
    list.innerHTML = "";
    Object.keys(chatHistory).forEach(number => {
        const div = document.createElement('div');
        div.style.padding = "15px";
        div.style.borderBottom = "1px solid #e2e8f0";
        div.style.cursor = "pointer";
        div.innerText = number;
        div.onclick = () => {
            activeContact = number;
            document.getElementById('display-name').innerText = "Chatten met: " + number;
            renderMessages();
        };
        list.appendChild(div);
    });
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    if (!activeContact) return alert("Kies een contact!");
    if (input.value.trim() !== "") {
        chatHistory[activeContact].push({ text: input.value, ghost: isGhostMode });
        localStorage.setItem('freechat_history', JSON.stringify(chatHistory));
        renderMessages();
        input.value = "";
    }
}

function renderMessages() {
    const msgBox = document.getElementById('message-box');
    msgBox.innerHTML = "";
    if (!activeContact) return;
    chatHistory[activeContact].forEach((msg) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = "msg-bubble";
        msgDiv.style.backgroundColor = msg.ghost ? "#334155" : "#0ea5e9";
        msgDiv.style.color = "white";
        msgDiv.style.padding = "10px";
        msgDiv.style.margin = "5px";
        msgDiv.style.borderRadius = "10px";
        msgDiv.style.alignSelf = "flex-end";
        msgDiv.innerHTML = msg.ghost ? `<i>Geest: ${msg.text}</i>` : msg.text;
        msgBox.appendChild(msgDiv);
        if(msg.ghost) setTimeout(() => msgDiv.remove(), 5000);
    });
}
